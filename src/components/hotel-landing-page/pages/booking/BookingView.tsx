"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ShieldCheck, 
  Calendar, 
  Users, 
  CreditCard, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Smartphone,
  Info,
  Building,
  Plus
} from "lucide-react";
import Link from "next/link";
import { rooms } from "../../data/data";

const bookingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().min(10, "Please provide a valid contact number"),
  gcashNumber: z.string().regex(/^(09|\+639)\d{9}$/, "Provide a valid 11-digit GCash number (e.g., 09171234567)"),
  specialRequests: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function BookingView() {
  const searchParams = useSearchParams();

  // Read current configuration parameters from URL state machine strings
  const roomIdsRaw = searchParams.get("roomIds") || searchParams.get("roomId") || "1";
  const checkinStr = searchParams.get("checkin") || "2026-06-01";
  const checkoutStr = searchParams.get("checkout") || "2026-06-04";
  const guestCount = searchParams.get("guests") || "2";

  const matchedRooms = useMemo(() => {
    const idsArray = roomIdsRaw.split(",").map((id) => Number(id.trim())).filter(Boolean);
    const items = rooms.filter((r) => idsArray.includes(r.id));
    return items.length > 0 ? items : [rooms[0]];
  }, [roomIdsRaw]);

  const totalNights = useMemo(() => {
    const start = new Date(checkinStr);
    const end = new Date(checkoutStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) || diffDays <= 0 ? 3 : diffDays;
  }, [checkinStr, checkoutStr]);

  const baseSubtotal = useMemo(() => {
    const rateSum = matchedRooms.reduce((sum, room) => sum + room.price, 0);
    return rateSum * totalNights;
  }, [matchedRooms, totalNights]);

  const localTaxVat = parseFloat((baseSubtotal * 0.12).toFixed(2));
  const serviceFeeFixed = 500; 
  const totalInvoiceGross = baseSubtotal + localTaxVat + serviceFeeFixed;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", gcashNumber: "", specialRequests: "" },
  });

  const onBookingExecute = async (data: BookingFormValues) => {
    console.log("Multi-room submission confirmed:", {
      guestDetails: data,
      reservationContext: {
        selectedRoomIds: matchedRooms.map(r => r.id),
        checkin: checkinStr,
        checkout: checkoutStr,
        grossTotalPHP: totalInvoiceGross,
      },
    });
    alert("GCash processing sandbox prompt simulated successfully!");
  };

  return (
    <div className="max-w-[1250px] mx-auto px-6">
      <div className="mb-8">
        <Link href="/hotel-landing-page/rooms" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors mb-4 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Cancel and Back to Catalog
        </Link>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900">
          Finalize Your <span className="font-serif italic font-normal text-zinc-700">Group Booking</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit(onBookingExecute)} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT COLUMN FORM INPUT FIELDS */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <User size={18} className="text-zinc-800" />
              <h2 className="text-base font-medium text-zinc-900">Guest Documentation Profiles</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">First Name</label>
                <input type="text" {...register("firstName")} placeholder="Juan" className={`w-full h-11 px-4 text-sm bg-zinc-50 border rounded-xl outline-none transition-all ${errors.firstName ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200 focus:border-zinc-900'}`} />
                {errors.firstName && <p className="text-rose-600 text-xs">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Last Name</label>
                <input type="text" {...register("lastName")} placeholder="Dela Cruz" className={`w-full h-11 px-4 text-sm bg-zinc-50 border rounded-xl outline-none transition-all ${errors.lastName ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200 focus:border-zinc-900'}`} />
                {errors.lastName && <p className="text-rose-600 text-xs">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Email Address</label>
                <input type="email" {...register("email")} placeholder="juan@gmail.com" className="w-full h-11 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-zinc-900 outline-none" />
                {errors.email && <p className="text-rose-600 text-xs">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Contact Number</label>
                <input type="tel" {...register("phone")} placeholder="09171234567" className="w-full h-11 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-zinc-900 outline-none" />
                {errors.phone && <p className="text-rose-600 text-xs">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Special Requests</label>
              <textarea {...register("specialRequests")} rows={3} placeholder="Interconnected room constraints..." className="w-full p-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-zinc-900 outline-none resize-none" />
            </div>
          </div>

          {/* GCASH FIELD GATEWAY */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-zinc-800" />
                <h2 className="text-base font-medium text-zinc-900">Mobile Wallet Gateway Verification</h2>
              </div>
              <div className="bg-[#0055E6] text-white font-black px-3 py-1 rounded text-xs italic select-none">gCASH</div>
            </div>
            <div className="space-y-1.5 max-w-md">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">GCash Mobile Number</label>
              <input type="text" {...register("gcashNumber")} placeholder="09171234567" className="w-full h-11 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-zinc-900 outline-none" />
              {errors.gcashNumber && <p className="text-rose-600 text-xs">{errors.gcashNumber.message}</p>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN INVOICE AND MULTI-ROOM ACCUMULATOR CONTROL LINK */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-sm space-y-6">
            
            <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-900 tracking-tight">Stay Summary Matrix</h3>
              <span className="bg-zinc-100 text-zinc-800 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Building size={11} /> {matchedRooms.length} Rooms
              </span>
            </div>
            
            {/* Dynamic Multi-Item Loop */}
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {matchedRooms.map((room) => (
                <div key={room.id} className="flex gap-3 items-center bg-zinc-50/50 border border-zinc-100 p-2.5 rounded-xl">
                  <img src={room.image} alt={room.name} className="w-14 aspect-[4/3] rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-grow">
                    <h4 className="font-medium text-zinc-900 text-xs truncate">{room.name}</h4>
                    <span className="text-[9px] text-zinc-400 block">{room.bed}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-zinc-900">₱{room.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* DYNAMIC "+ ADD ANOTHER ROOM" IMPLEMENTATION LINK TARGET (Option B Core Logic) */}
            <Link 
              href={`/hotel-landing-page/rooms?roomIds=${roomIdsRaw}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestCount}`}
              className="w-full py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              Add Another Room to Booking
            </Link>

            <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-xs">
              <div>
                <span className="text-zinc-400 block mb-0.5">Check-In</span>
                <p className="font-medium text-zinc-800">{checkinStr}</p>
              </div>
              <div className="border-l border-zinc-200 pl-4">
                <span className="text-zinc-400 block mb-0.5">Check-Out</span>
                <p className="font-medium text-zinc-800">{checkoutStr}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-3 text-xs">
              <div className="flex justify-between items-center text-zinc-500">
                <span>Rooms Subtotal ({totalNights} Nights)</span>
                <span className="font-medium text-zinc-800">₱{baseSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>Local Occupancy VAT (12%)</span>
                <span className="font-medium text-zinc-800">₱{localTaxVat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>Infrastructure Service Fee</span>
                <span className="font-medium text-zinc-800">₱{serviceFeeFixed.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-zinc-200 flex justify-between items-baseline">
                <span className="text-sm font-medium text-zinc-900">Total Payable Amount</span>
                <span className="text-2xl font-bold text-[#0055E6]">₱{totalInvoiceGross.toLocaleString()}</span>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#0055E6] hover:bg-[#004cd0] text-white font-medium text-xs rounded-xl uppercase tracking-wide shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <CreditCard size={14} />
              {isSubmitting ? "Processing Request..." : "Confirm & Pay via GCash"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}