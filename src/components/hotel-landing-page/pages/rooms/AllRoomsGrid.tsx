"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, BedDouble, Maximize, SlidersHorizontal, Eye, Check, Plus } from "lucide-react";
import { rooms } from "../../data/data";

export function AllRoomsGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");

  const existingRoomIdsRaw = searchParams.get("roomIds") || searchParams.get("roomId") || "";
  const checkinStr = searchParams.get("checkin") || "2026-06-01";
  const checkoutStr = searchParams.get("checkout") || "2026-06-04";
  const guestCount = searchParams.get("guests") || "2";

  const activeSelectedIds = useMemo(() => {
    if (!existingRoomIdsRaw) return [];
    return existingRoomIdsRaw.split(",").map((id) => Number(id.trim())).filter(Boolean);
  }, [existingRoomIdsRaw]);

  const categories = ["All", ...Array.from(new Set(rooms.map((r) => r.badge || "Standard")))];

  const filteredRooms = activeCategory === "All" 
    ? rooms 
    : rooms.filter((room) => room.badge === activeCategory);

  // Navigate straight to the detail page while keeping selection parameters intact
  const viewRoomDetails = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/hotel-landing-page/rooms/${id}?${params.toString()}`);
  };

  return (
    <div className="max-w-[1300px] mx-auto px-6">
      
      {activeSelectedIds.length > 0 && (
        <div className="mb-6 p-4 bg-zinc-900 text-white rounded-xl flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
        
            <p className="font-light">
              Active Selection Session: You have <span className="font-semibold">{activeSelectedIds.length} space(s)</span> ready. Select another card below to examine details.
            </p>
          </div>
          <Link 
            href={`/hotel-landing-page/booking?roomIds=${existingRoomIdsRaw}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestCount}`}
            className="underline hover:text-zinc-200 font-medium transition-colors"
          >
            Return to Checkout Summary →
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-zinc-400 block mb-2">Available Inventory Options</span>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900">Select Your Spaces</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-50 border border-zinc-200/60 px-3 py-1.5 rounded-lg w-fit">
          <SlidersHorizontal size={14} />
          <span>{filteredRooms.length} Options Found</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-zinc-100 pb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeCategory === category ? "bg-zinc-950 text-white shadow-sm" : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/40"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredRooms.map((room) => {
          const isAlreadySelected = activeSelectedIds.includes(room.id);

          return (
            <div 
              key={room.id} 
              onClick={() => viewRoomDetails(room.id)}
              className={`group bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full cursor-pointer ${
                isAlreadySelected ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-100'
              }`}
            >
              <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden shrink-0">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                {isAlreadySelected && (
                  <span className="absolute top-3 right-3 text-[10px] uppercase font-semibold tracking-wider bg-zinc-900 text-white px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                    <Check size={10} /> Active Selection
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col justify-between flex-grow">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-medium text-zinc-900 text-base tracking-tight leading-snug">{room.name}</h3>
                    <div className="flex items-center gap-1 shrink-0 text-xs font-medium text-zinc-700 pt-0.5">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      <span>{room.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-400 font-light pt-1">
                    <div className="flex items-center gap-1">
                      <BedDouble size={14} className="text-zinc-400" />
                      <span>{room.bed}</span>
                    </div>
                    <span className="text-zinc-200">•</span>
                    <div className="flex items-center gap-1">
                      <Maximize size={13} className="text-zinc-400" />
                      <span>{room.sqm}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-zinc-50 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-zinc-400 font-light block">Rate / Night</span>
                    <span className="text-base font-semibold text-zinc-950">₱{room.price.toLocaleString()}</span>
                  </div>

                  <span className="text-xs font-medium text-zinc-800 group-hover:text-zinc-950 transition-colors flex items-center gap-1">
                    <Plus size={14} /> View & Add
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}