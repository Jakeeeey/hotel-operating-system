"use client";

import { useMemo, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createBookingTransaction } from "./services/booking.service";
import { RoomData } from "../home/types/room.types";
import { BookingStatusModal, type ModalState } from "./components/BookingStatusModal";
import { BookingSummaryCard } from "./components/BookingSummaryCard";
import { BookingFormFields } from "./components/BookingFormFields";
import { BookingFormValues, bookingSchema } from "./schema/booking.schema";

interface BookingTransactionPayload {
  roomIds: number[];
  roomTypeId: number;
  roomDetails: Array<{ id: number; name: string; price: number }>;
  totalNights: number;
  checkin: string;
  checkout: string;
  total: number;
  adults: number;
  children: number;
}

interface BookingTransactionResponse {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

export function BookingView({ rooms }: { rooms: RoomData[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "warning",
    title: "",
    description: "",
  });

  const roomIdsRaw: string = searchParams.get("roomIds") || searchParams.get("roomId") || "1";
  const checkinStr: string = searchParams.get("checkin") || "";
  const checkoutStr: string = searchParams.get("checkout") || "";
  
  const adultsCount = useMemo<number>(() => {
    return Number(searchParams.get("adults") ?? 2);
  }, [searchParams]);

  const childrenCount = useMemo<number>(() => {
    return Number(searchParams.get("children") ?? 0);
  }, [searchParams]);

  const matchedRooms = useMemo<RoomData[]>(() => {
    const ids: number[] = roomIdsRaw.split(",").map(Number);
    return rooms.filter((r: RoomData) => ids.includes(r.id));
  }, [roomIdsRaw, rooms]);

  const handleRemoveRoom = (idToRemove: number): void => {
    const currentIds: number[] = roomIdsRaw.split(",").map(Number);
    const updatedIds: number[] = currentIds.filter((id: number) => id !== idToRemove);

    const params = new URLSearchParams(searchParams.toString());

    if (updatedIds.length === 0) {
      router.push(`/hotel-landing-page/rooms?${params.toString()}`);
      return;
    }

    params.set("roomIds", updatedIds.join(","));
    if (params.has("roomId")) params.delete("roomId");

    router.push(`/hotel-landing-page/booking?${params.toString()}`);
  };

  const totalNights = useMemo<number>(() => {
    if (!checkinStr || !checkoutStr) return 0;
    const start = new Date(checkinStr);
    const end = new Date(checkoutStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) || diffDays <= 0 ? 0 : diffDays;
  }, [checkinStr, checkoutStr]);

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "Select date";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Select date";
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return "Select date";
    }
  };

  const getInitialValues = (): BookingFormValues => {
    if (typeof window !== "undefined") {
      const draft = sessionStorage.getItem("bookingFormDraft");
      if (draft) {
        try {
          return JSON.parse(draft) as BookingFormValues;
        } catch (e) {
          console.error("Failed to parse form draft", e);
        }
      }
    }
    return { firstName: "", lastName: "", email: "", phone: "", gcashNumber: "", specialRequests: "" };
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: getInitialValues(),
  });

  const currentFormValues = watch();
  useEffect(() => {
    if (Object.keys(currentFormValues).length > 0) {
      sessionStorage.setItem("bookingFormDraft", JSON.stringify(currentFormValues));
    }
  }, [currentFormValues]);
  
  const baseSubtotal = useMemo<number>(() => {
    const rateSum: number = matchedRooms.reduce((sum: number, room: RoomData) => sum + room.price, 0);
    return rateSum * totalNights;
  }, [matchedRooms, totalNights]);

  const totalInvoiceGross: number = baseSubtotal;

  const onBookingExecute = async (data: BookingFormValues): Promise<void> => {
    if (!checkinStr || !checkoutStr) {
      setModal({
        isOpen: true,
        type: "warning",
        title: "Please Select Your Dates",
        description: "Choose your arrival and departure dates on the calendar before processing your payment.",
      });
      return;
    }

    if (matchedRooms.length === 0) {
      setModal({
        isOpen: true,
        type: "warning",
        title: "No Rooms Selected",
        description: "Your cart is currently empty. Please select at least one room layout to secure a booking.",
      });
      return;
    }

    const fallbackRoomTypeId: number = matchedRooms[0]?.id || 1;

    const payload: BookingTransactionPayload = {
      roomIds: matchedRooms.map((r: RoomData) => r.id),
      roomTypeId: fallbackRoomTypeId,
      roomDetails: matchedRooms.map((r: RoomData) => ({ id: r.id, name: r.name, price: r.price })),
      totalNights: totalNights,
      checkin: checkinStr,
      checkout: checkoutStr,
      total: totalInvoiceGross,
      adults: adultsCount,
      children: childrenCount,
    };

    try {
      const result = await createBookingTransaction(data, payload) as BookingTransactionResponse;

      if (result?.success && result.checkoutUrl) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("bookingFormDraft");
          window.location.href = result.checkoutUrl;
        }
      } else {
        setModal({
          isOpen: true,
          type: "error",
          title: "Payment Gateway Refused Connection",
          description: result?.error || "We couldn't initialize your secure payment checkout loop. Please verify your details and try again.",
        });
      }
    } catch (error: unknown) {
      console.error("Booking submission error:", error);
      setModal({
        isOpen: true,
        type: "error",
        title: "Network Connection Error",
        description: error instanceof Error ? error.message : "The request timed out or was interrupted. Please check your internet connection and resubmit.",
      });
    }
  };

  const handleModalClose = (): void => {
    setModal((prev: ModalState) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 relative">
      <div className="mb-12 border-b border-zinc-200 pb-8">
        <Link 
          href={`/hotel-landing-page/rooms?${searchParams.toString()}`} 
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-zinc-900 transition-colors mb-5 group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform text-zinc-400 group-hover:text-zinc-900" />
          Back to Selection Catalog
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-zinc-900 font-normal">
          Finalize Your <span className="italic font-light text-zinc-500">Booking</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit(onBookingExecute)} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <BookingFormFields register={register} errors={errors} />

        <BookingSummaryCard 
          matchedRooms={matchedRooms}
          handleRemoveRoom={handleRemoveRoom}
          roomIdsRaw={roomIdsRaw}
          checkinStr={checkinStr}
          checkoutStr={checkoutStr}
          adultsCount={adultsCount}
          childrenCount={childrenCount}
          formatDisplayDate={formatDisplayDate}
          searchParamsStr={searchParams.toString()}
          totalNights={totalNights}
          baseSubtotal={baseSubtotal}
          totalInvoiceGross={totalInvoiceGross}
          isSubmitting={isSubmitting}
        />
      </form>

      <BookingStatusModal modal={modal} onClose={handleModalClose} />
    </div>
  );
}