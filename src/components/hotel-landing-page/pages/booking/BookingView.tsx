"use client";

import { useMemo, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { createBookingTransaction } from "./services/booking.service";

import { RoomData } from "../home/types/room.types";
import { BookingStatusModal, type ModalState } from "./components/BookingStatusModal";
import { BookingSummaryCard } from "./components/BookingSummaryCard";
import { BookingFormFields } from "./components/BookingFormFields";
import { BookingFormValues, bookingSchema } from "./schema/booking.schema";



export function BookingView({ rooms }: { rooms: RoomData[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "success",
    title: "",
    description: "",
  });

  const roomIdsRaw = searchParams.get("roomIds") || searchParams.get("roomId") || "1";
  const checkinStr = searchParams.get("checkin") || "";
  const checkoutStr = searchParams.get("checkout") || "";
  
  const adultsCount = useMemo(() => {
    return Number(searchParams.get("adults") ?? 2);
  }, [searchParams]);

  const childrenCount = useMemo(() => {
    return Number(searchParams.get("children") ?? 0);
  }, [searchParams]);

  const matchedRooms = useMemo(() => {
    const ids = roomIdsRaw.split(",").map(Number);
    return rooms.filter((r) => ids.includes(r.id));
  }, [roomIdsRaw, rooms]);

  const handleRemoveRoom = (idToRemove: number) => {
    const currentIds = roomIdsRaw.split(",").map(Number);
    const updatedIds = currentIds.filter((id) => id !== idToRemove);

    const params = new URLSearchParams(searchParams.toString());

    if (updatedIds.length === 0) {
      router.push(`/hotel-landing-page/rooms?${params.toString()}`);
      return;
    }

    params.set("roomIds", updatedIds.join(","));
    if (params.has("roomId")) params.delete("roomId");

    router.push(`/hotel-landing-page/booking?${params.toString()}`);
  };

  const totalNights = useMemo(() => {
    if (!checkinStr || !checkoutStr) return 0;
    const start = new Date(checkinStr);
    const end = new Date(checkoutStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) || diffDays <= 0 ? 0 : diffDays;
  }, [checkinStr, checkoutStr]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Select date";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Select date";
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return "Select date";
    }
  };

  const getInitialValues = () => {
    if (typeof window !== "undefined") {
      const draft = sessionStorage.getItem("bookingFormDraft");
      if (draft) {
        try {
          return JSON.parse(draft);
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
  
  const baseSubtotal = useMemo(() => {
    const rateSum = matchedRooms.reduce((sum, room) => sum + room.price, 0);
    return rateSum * totalNights;
  }, [matchedRooms, totalNights]);

  const totalInvoiceGross = baseSubtotal;

  const onBookingExecute = async (data: BookingFormValues) => {
    // 1. Check if check-in/check-out dates are missing
    if (!checkinStr || !checkoutStr) {
      setModal({
        isOpen: true,
        type: "warning",
        title: "Please Select Your Dates",
        description: "Choose your arrival and departure dates on the calendar before processing your payment.",
      });
      return;
    }

    // 2. Check if no rooms are selected
    if (matchedRooms.length === 0) {
      setModal({
        isOpen: true,
        type: "warning",
        title: "No Rooms Selected",
        description: "Your cart is currently empty. Please select at least one room layout to secure a booking.",
      });
      return;
    }

    const payload = {
      roomIds: matchedRooms.map(r => r.id),
      checkin: checkinStr,
      checkout: checkoutStr,
      total: totalInvoiceGross,
      adults: adultsCount,
      children: childrenCount,
    };
    
    console.log("Sending to service:", { data, payload });

    try {
      const result = await createBookingTransaction(data, payload);

      if (result?.success) {
        sessionStorage.removeItem("bookingFormDraft");
        setModal({
          isOpen: true,
          type: "success",
          title: "Booking Confirmed!",
          description: "Your reservation has been successfully placed. We have sent a complete breakdown copy directly to your inbox.",
          reservationId: result.id,
        });
      } else {
        setModal({
          isOpen: true,
          type: "error",
          title: "Booking Failed",
          description: result.error || "We couldn't process your payment registration. Please review your balance credentials and try again.",
        });
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      setModal({
        isOpen: true,
        type: "error",
        title: "Network Connection Error",
        description: "The request timed out or was interrupted. Please check your internet connection and resubmit.",
      });
    }
  };

  const handleModalClose = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
    
    if (modal.type === "success") {
      router.push("/hotel-landing-page/rooms");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 relative">
      
      <div className="mb-12 border-b border-zinc-200 pb-8">
        <Link href={`/hotel-landing-page/rooms?${searchParams.toString()}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-zinc-900 transition-colors mb-5 group">
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform text-zinc-400 group-hover:text-zinc-900" />
          Back to Selection Catalog
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-zinc-900 font-normal">
          Finalize Your <span className="italic font-light text-zinc-500">Booking</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit(onBookingExecute)} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column Form inputs */}
        <BookingFormFields register={register} errors={errors} />

        {/* Right Column Checkout Pricing Breakdown */}
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

      {/* LUXURY HOTEL BOOKING DIALOG SYSTEM */}
      <BookingStatusModal modal={modal} onClose={handleModalClose} />
    </div>
  );
}