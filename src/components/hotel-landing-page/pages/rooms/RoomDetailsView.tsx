"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Star, 
  BedDouble, 
  Maximize, 
  Calendar, 
  Users, 
  ArrowLeft, 
  CheckCircle2, 
  Wifi, 
  Wind, 
  ShieldCheck,
  Plus,
  ShoppingBag,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { RoomData } from "../../types/types";

interface RoomDetailsViewProps {
  room: RoomData;
}

export function RoomDetailsView({ room }: RoomDetailsViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract ongoing selection variables from the session parameters
  const existingRoomIdsRaw = searchParams.get("roomIds") || searchParams.get("roomId") || "";
  const checkinStr = searchParams.get("checkin") || "2026-06-01";
  const checkoutStr = searchParams.get("checkout") || "2026-06-04";
  const guestCount = searchParams.get("guests") || "2";

  // Parse arrays to identify existing selections
  const activeSelectedIds = useMemo(() => {
    if (!existingRoomIdsRaw) return [];
    return existingRoomIdsRaw.split(",").map((id) => Number(id.trim())).filter(Boolean);
  }, [existingRoomIdsRaw]);

  const isAlreadySelected = activeSelectedIds.includes(room.id);

  // Append logic execution loop
  const handleSelectionAction = () => {
    let updatedIds = [...activeSelectedIds];
    
    if (!updatedIds.includes(room.id)) {
      updatedIds.push(room.id);
    }

    const finalQueryString = updatedIds.join(",");
    router.push(
      `/hotel-landing-page/booking?roomIds=${finalQueryString}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestCount}`
    );
  };

  return (
    <div className="max-w-[1300px] mx-auto px-6">
      {/* Funnel Navigation - Restores selection params safely to grid directory */}
      <Link 
        href={`/hotel-landing-page/rooms?roomIds=${existingRoomIdsRaw}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestCount}`} 
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-8 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to All Spaces
      </Link>

      {/* Multi-Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 rounded-2xl overflow-hidden shadow-sm">
        <div className="md:col-span-2 aspect-[16/10] bg-zinc-100">
          <img 
            src={room.image} 
            alt={room.name} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="hidden md:flex flex-col gap-4">
          <div className="h-1/2 bg-zinc-100">
            <img 
              src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600" 
              alt="Interior framing" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="h-1/2 bg-zinc-100">
            <img 
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600" 
              alt="Luxury lounge area" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </div>

      {/* Grid Content Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Info Column */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 bg-zinc-900 text-white rounded-md">
                {room.badge}
              </span>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                {room.availabilityText}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900">
              {room.name}
            </h1>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 bg-white p-5 border border-zinc-100 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-400 font-light">Configuration</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-800">
                <BedDouble size={16} className="text-zinc-500" />
                <span>{room.bed}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-400 font-light">Total Size</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-800">
                <Maximize size={16} className="text-zinc-500" />
                <span>{room.sqm}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-400 font-light">Rating</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-800">
                <Star size={15} className="text-amber-500 fill-amber-500" />
                <span>{room.rating} ({room.reviews})</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-900 tracking-tight">About the Stay</h3>
            <p className="text-zinc-500 font-light leading-relaxed text-[15px]">
              Indulge in unmatched refinement inside this masterfully architected sanctuary space. Programmed with bespoke lifestyle finishings and wide-angle scenery portals, this layout is crafted precisely for travelers prioritizing absolute serenity during their stay.
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-900 tracking-tight">Included Premium Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.amenities.map((item) => (
                <div key={item} className="flex items-center gap-2.5 bg-white p-3 border border-zinc-100 rounded-lg text-sm text-zinc-700">
                  <CheckCircle2 size={15} className="text-zinc-900 shrink-0" />
                  <span className="font-light">{item}</span>
                </div>
              ))}
              <div className="flex items-center gap-2.5 bg-white p-3 border border-zinc-100 rounded-lg text-sm text-zinc-700">
                <Wifi size={15} className="text-zinc-900 shrink-0" />
                <span className="font-light">Complimentary Fiber</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white p-3 border border-zinc-100 rounded-lg text-sm text-zinc-700">
                <Wind size={15} className="text-zinc-900 shrink-0" />
                <span className="font-light">Climate Control</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Reservation Column */}
        <div className="lg:sticky lg:top-28 bg-white border border-zinc-100 shadow-sm rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Rate per Night</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-zinc-950">₱{room.price.toLocaleString()}</span>
              <span className="text-xs text-zinc-400 font-light">/ night</span>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-200 overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-zinc-200">
                <div className="p-3 bg-zinc-50/50">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1 flex items-center gap-1">
                    <Calendar size={10} /> Check-In
                  </label>
                  <input 
                    type="text" 
                    readOnly 
                    value={checkinStr} 
                    className="bg-transparent text-zinc-800 text-xs font-normal focus:outline-none w-full select-none" 
                  />
                </div>
                <div className="p-3 bg-zinc-50/50">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1 flex items-center gap-1">
                    <Calendar size={10} /> Check-Out
                  </label>
                  <input 
                    type="text" 
                    readOnly 
                    value={checkoutStr} 
                    className="bg-transparent text-zinc-800 text-xs font-normal focus:outline-none w-full select-none" 
                  />
                </div>
              </div>
              <div className="p-3 bg-zinc-50/50">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1 flex items-center gap-1">
                  <Users size={10} /> Total Occupants
                </label>
                <select disabled className="bg-transparent text-zinc-700 text-xs font-light focus:outline-none w-full cursor-not-allowed">
                  <option>{guestCount} Guests Registered</option>
                </select>
              </div>
            </div>

            {/* Smart Contextual Submission Dispatcher Action Buttons */}
            {isAlreadySelected ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-xl flex items-start gap-2 text-xs font-light leading-tight">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>This suite is already part of your active reservation bundle. Duplicate room entries are disabled.</span>
                </div>
                <Link 
                  href={`/hotel-landing-page/booking?roomIds=${existingRoomIdsRaw}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestCount}`}
                  className="w-full py-3.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-sm text-center block uppercase tracking-wide"
                >
                  Return to Booking Form
                </Link>
              </div>
            ) : (
              <button 
                onClick={handleSelectionAction}
                className="w-full py-3.5 bg-zinc-950 hover:bg-black text-white rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-sm text-center flex items-center justify-center gap-2"
              >
                {activeSelectedIds.length > 0 ? (
                  <>
                    <Plus size={14} /> Add Suite to Active Group Booking
                  </>
                ) : (
                  <>
                    Proceed to Secure Reservation
                  </>
                )}
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-light">
            <ShieldCheck size={14} className="text-zinc-500" />
            <span>Best Rate Guaranteed & Encrypted Verification</span>
          </div>
        </div>

      </div>
    </div>
  );
}