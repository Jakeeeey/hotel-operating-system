"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Calendar, ArrowRight } from "lucide-react";
import { verifyAndFinalizeReservation } from "../services/payment/verification.service";

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface VerificationState {
  status: "loading" | "confirmed" | "failed";
  guestName: string;
  email: string;
  totalAmount: number;
  errorMessage: string;
  emailSent: boolean;
}

export default function BookingSuccessPage({ searchParams }: SuccessPageProps) {
  const router = useRouter();
  const resolvedParams = use(searchParams);
  const reservationId = typeof resolvedParams.reservationId === "string" ? resolvedParams.reservationId : "";

  const [state, setState] = useState<VerificationState>({
    status: "loading",
    guestName: "",
    email: "",
    totalAmount: 0,
    errorMessage: "",
    emailSent: false,
  });

  useEffect(() => {
    if (!reservationId) {
      setState((prev) => ({
        ...prev,
        status: "failed",
        errorMessage: "Invalid URL state structure. No reservation reference parameters detected.",
      }));
      return;
    }

    const processVerification = async (): Promise<void> => {
      const verification = await verifyAndFinalizeReservation(reservationId);

      if (verification.success) {
        setState({
          status: "confirmed",
          guestName: verification.guestName || "Valued Guest",
          email: verification.email || "",
          totalAmount: verification.totalAmount || 0,
          errorMessage: "",
          emailSent: false,
        });

        // TRIGGER TRANSITIONAL CONFIRMATION EMAIL
        try {
          // Dispatch Email — API fetches guest data from DB using reservationId
          const emailResponse = await fetch("/api/hos/send-booking-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reservationId }),
          });

          const emailData = await emailResponse.json();
          if (!emailResponse.ok) throw new Error(emailData.error);

          console.log("Transactional check-in email routed successfully:", emailData.messageId);
          
          setState((prev) => ({
            ...prev,
            emailSent: true,
          }));
        } catch (emailError) {
          console.error("Email dispatch routine encountered an unexpected fault context:", emailError);
        }

      } else {
        setState((prev) => ({
          ...prev,
          status: "failed",
          errorMessage: verification.error || "Could not reconcile payment logs against this allocation sequence.",
        }));
      }
    };

    if (state.status === "loading") {
      void processVerification();
    }
  }, [reservationId, state.status]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-zinc-50/50">
      <div className="max-w-[520px] w-full bg-white border border-zinc-200/80 shadow-sm p-8 md:p-10 rounded-none text-center">
        
        {/* STATE: LOADING TRANSACTION RECORD METRICS */}
        {state.status === "loading" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-10 h-10 animate-spin text-zinc-400 stroke-[1.5]" />
            <h2 className="text-xl font-serif text-zinc-900 mt-6 tracking-tight">Verifying Your Transaction</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-[340px]">
              Securing room inventory logs and matching your checkout sequence tokens. Please do not close this view.
            </p>
          </div>
        )}

        {/* STATE: TRANSACTION COMPLETED & SETTLED SUCCESSFULLY */}
        {state.status === "confirmed" && (
          <div className="flex flex-col items-center animate-in fade-in duration-500">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6">
              <CheckCircle2 className="w-6 h-6 stroke-[1.75]" />
            </div>
            
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Reservation Confirmed
            </span>
            <h2 className="text-3xl font-serif text-zinc-900 font-normal tracking-tight">
              Your Stay is <span className="italic font-light text-zinc-500">Secured</span>
            </h2>
            
            <div className="w-full border-t border-b border-zinc-100 my-8 py-5 text-left space-y-3.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-medium uppercase tracking-wider">Reference Code</span>
                <span className="font-mono font-bold text-zinc-900">#{reservationId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-medium uppercase tracking-wider">Primary Guest</span>
                <span className="font-medium text-zinc-900">{state.guestName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-medium uppercase tracking-wider">Total Amount Paid</span>
                <span className="font-bold text-zinc-900">PHP {state.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-zinc-50 p-4 w-full flex items-start gap-3 text-left mb-8 border border-zinc-100">
              <Calendar className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  A complete physical digital itinerary statement and balance payment breakdown notation ledger has been forwarded to <span className="font-semibold text-zinc-950">{state.email}</span>.
                </p>
                {state.emailSent ? (
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1">
                    ✓ Digital QR pass dispatched
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-400 font-medium tracking-wide animate-pulse mt-1">
                    Generating check-in pass voucher...
                  </span>
                )}
              </div>
            </div>

            <Link 
              href="/hotel-landing-page/rooms" 
              className="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 text-white text-xs font-bold uppercase tracking-[0.15em] py-4 px-6 hover:bg-zinc-800 transition-colors group"
            >
              Return to Catalog
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}

        {/* STATE: GATEWAY TRANSACTION TIMEOUT OR VALIDATION FAILURE */}
        {state.status === "failed" && (
          <div className="flex flex-col items-center animate-in fade-in duration-500">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-6">
              <XCircle className="w-6 h-6 stroke-[1.75]" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500 mb-2">
              Verification Failure
            </span>
            <h2 className="text-2xl font-serif text-zinc-900 font-normal tracking-tight">
              Unable to Validate Status
            </h2>
            
            <p className="text-xs text-zinc-500 leading-relaxed mt-4 bg-rose-50/50 border border-rose-100/60 p-4 w-full text-center rounded-none font-medium">
              {state.errorMessage}
            </p>

            <p className="text-xs text-zinc-400 leading-relaxed mt-4 mb-8 text-center">
              If your financial statement reflects deductions from PayMongo transaction engines, please do not re-book. Reach out directly to our guest desk alongside reference allocation string: <span className="font-mono font-bold text-zinc-700">#{reservationId || "NONE"}</span>.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                onClick={() => window.location.reload()} 
                className="inline-flex items-center justify-center text-xs font-bold uppercase tracking-[0.15em] py-4 px-4 border border-zinc-200 hover:border-zinc-900 text-zinc-800 transition-colors"
              >
                Retry Check
              </button>
              <Link 
                href="/hotel-landing-page/rooms" 
                className="inline-flex items-center justify-center bg-zinc-900 text-white text-xs font-bold uppercase tracking-[0.15em] py-4 px-4 hover:bg-zinc-800 transition-colors"
              >
                Catalog View
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}