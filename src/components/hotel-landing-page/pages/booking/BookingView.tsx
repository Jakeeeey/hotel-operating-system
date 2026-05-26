"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CreditCard, 
  ArrowLeft, 
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

  const formatDisplayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

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
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      
      {/* Top Header Navigation Line */}
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
        
        {/* LEFT COLUMN: CRISP ARCHITECTURAL INPUT FORMS */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Section: Guest Documentation */}
          <div className="border border-zinc-200 bg-white p-6 rounded-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">01</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">Guest Documentation Profile</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">First Name</label>
                <input type="text" {...register("firstName")} placeholder="Juan" className={`w-full h-10 px-3 text-sm bg-zinc-50/50 border rounded-sm outline-none font-sans transition-all placeholder:text-zinc-300 ${errors.firstName ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'}`} />
                {errors.firstName && <p className="text-red-500 text-[11px] tracking-normal font-sans mt-1">*{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">Last Name</label>
                <input type="text" {...register("lastName")} placeholder="Dela Cruz" className={`w-full h-10 px-3 text-sm bg-zinc-50/50 border rounded-sm outline-none font-sans transition-all placeholder:text-zinc-300 ${errors.lastName ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'}`} />
                {errors.lastName && <p className="text-red-500 text-[11px] tracking-normal font-sans mt-1">*{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">Email Address</label>
                <input type="email" {...register("email")} placeholder="juan@gmail.com" className={`w-full h-10 px-3 text-sm bg-zinc-50/50 border rounded-sm outline-none font-sans transition-all placeholder:text-zinc-300 ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'}`} />
                {errors.email && <p className="text-red-500 text-[11px] tracking-normal font-sans mt-1">*{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">Contact Number</label>
                <input type="tel" {...register("phone")} placeholder="09171234567" className={`w-full h-10 px-3 text-sm bg-zinc-50/50 border rounded-sm outline-none font-sans transition-all placeholder:text-zinc-300 ${errors.phone ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'}`} />
                {errors.phone && <p className="text-red-500 text-[11px] tracking-normal font-sans mt-1">*{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">Special Requests</label>
              <textarea {...register("specialRequests")} rows={3} placeholder="Interconnected room constraints, accessibility adjustments, or structural preferences..." className="w-full p-3 text-sm bg-zinc-50/50 border border-zinc-200 rounded-sm focus:border-zinc-900 focus:bg-white outline-none resize-none font-sans transition-all placeholder:text-zinc-300" />
            </div>
          </div>

          {/* Section: Payment Gateway */}
          <div className="border border-zinc-200 bg-white p-6 rounded-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">02</span>
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">Mobile Wallet Gateway Verification</h2>
              </div>
              <span className="bg-zinc-950 text-white font-sans text-[9px] font-black tracking-[0.2em] px-2.5 py-1 rounded-sm select-none">GCASH</span>
            </div>
            
            <div className="space-y-1.5 max-w-sm">
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">GCash Mobile Number</label>
              <input type="text" {...register("gcashNumber")} placeholder="09171234567" className={`w-full h-10 px-3 text-sm bg-zinc-50/50 border rounded-sm outline-none font-sans transition-all placeholder:text-zinc-300 ${errors.gcashNumber ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'}`} />
              {errors.gcashNumber && <p className="text-red-500 text-[11px] tracking-normal font-sans mt-1">*{errors.gcashNumber.message}</p>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REFINED LEDGER AND ACCUMULATOR CONTROL */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-zinc-200 bg-white rounded-sm p-6 space-y-6">
            
            <div className="border-b border-zinc-100 pb-4 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">Stay Summary Matrix</h3>
              <span className="border border-zinc-200 text-zinc-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm flex items-center gap-1">
                {matchedRooms.length} {matchedRooms.length === 1 ? "Space" : "Spaces"}
              </span>
            </div>
            
            {/* Fine Room Line-Items Loop */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 divide-y divide-zinc-50">
              {matchedRooms.map((room, idx) => (
                <div key={room.id} className={`flex gap-4 items-center ${idx > 0 ? 'pt-3' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={room.image} alt={room.name} className="w-16 aspect-[4/3] rounded-sm object-cover shrink-0 grayscale-[20%] border border-zinc-100" />
                  <div className="min-w-0 flex-grow">
                    <h4 className="font-serif text-sm text-zinc-900 truncate font-medium">{room.name}</h4>
                    <span className="text-[10px] text-zinc-400 tracking-wide block mt-0.5">{room.bed}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-zinc-900">₱{room.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Link: Add Another Room */}
            <Link 
              href={`/hotel-landing-page/rooms?roomIds=${roomIdsRaw}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestCount}`}
              className="w-full py-2.5 border border-dashed border-zinc-300 hover:border-zinc-900 text-zinc-800 rounded-sm text-[10px] font-bold uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={12} className="text-zinc-500" />
              Add Rooms to Booking
            </Link>

            {/* Structured Compact Stay Frame */}
            <div className="relative group/date overflow-hidden rounded-sm border border-zinc-200 p-4 bg-zinc-50/50 flex items-center justify-between text-xs">
              <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 block mb-1">Arrival</span>
                  <p className="font-medium font-sans text-zinc-800">{formatDisplayDate(checkinStr)}</p>
                </div>
                <div className="border-l border-zinc-200 pl-4">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 block mb-1">Departure</span>
                  <p className="font-medium font-sans text-zinc-800">{formatDisplayDate(checkoutStr)}</p>
                </div>
              </div>

              {/* Sophisticated Hover Link Overlay */}
              <Link 
                href={`/hotel-landing-page/availability?${searchParams.toString()}`}
                className="absolute inset-0 flex items-center justify-center bg-zinc-950/0 group-hover/date:bg-zinc-950/60 transition-all duration-300 backdrop-blur-[0px] group-hover/date:backdrop-blur-[2px] opacity-0 group-hover/date:opacity-100 cursor-pointer text-center"
              >
                <span className="bg-white text-zinc-900 text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-sm shadow-xl transform translate-y-2 group-hover/date:translate-y-0 transition-all duration-300">
                  Modify Dates
                </span>
              </Link>
            </div>

            {/* Financial Ledger Block */}
            <div className="pt-2 border-t border-zinc-100 space-y-3 text-xs font-sans">
              <div className="flex justify-between items-center text-zinc-500">
                <span>Subtotal ({totalNights} {totalNights === 1 ? "Night" : "Nights"})</span>
                <span className="font-medium text-zinc-800">₱{baseSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>Value Added Tax (12%)</span>
                <span className="font-medium text-zinc-800">₱{localTaxVat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>Service Infrastructure Fee</span>
                <span className="font-medium text-zinc-800">₱{serviceFeeFixed.toLocaleString()}</span>
              </div>
              
              <div className="pt-5 border-t border-zinc-200 flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">Total Invoice</span>
                <span className="text-2xl font-normal font-serif text-zinc-950">₱{totalInvoiceGross.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Block */}
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full py-4 bg-zinc-950 hover:bg-black disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <CreditCard size={13} />
              {isSubmitting ? "Processing Transaction..." : "Authorize Agreement & Pay"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}