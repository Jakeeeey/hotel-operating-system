"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  BedDouble,
  Maximize,
  SlidersHorizontal,
  Check,
  Plus,
  Calendar,
  Users,
  ArrowRight,
  Building,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { rooms } from "../../data/data";

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function AllRoomsGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");

  const existingRoomIdsRaw =
    searchParams.get("roomIds") || searchParams.get("roomId") || "";
  const checkinStr = searchParams.get("checkin") || "2026-06-01";
  const checkoutStr = searchParams.get("checkout") || "2026-06-04";
  const guestCount = searchParams.get("guests") || "2";

  const calculatedNights = useMemo(() => {
    if (!checkinStr || !checkoutStr) return 0;
    return Math.round(
      (new Date(checkoutStr).getTime() - new Date(checkinStr).getTime()) /
        86400000,
    );
  }, [checkinStr, checkoutStr]);

  const activeSelectedIds = useMemo(() => {
    if (!existingRoomIdsRaw) return [];
    return existingRoomIdsRaw
      .split(",")
      .map((id) => Number(id.trim()))
      .filter(Boolean);
  }, [existingRoomIdsRaw]);

  const categories = [
    "All",
    ...Array.from(new Set(rooms.map((r) => r.badge || "Standard"))),
  ];

  const filteredRooms =
    activeCategory === "All"
      ? rooms
      : rooms.filter((room) => room.badge === activeCategory);

  // Navigate straight to the detail page while keeping selection parameters intact
  const viewRoomDetails = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/hotel-landing-page/rooms/${id}?${params.toString()}`);
  };

  return (
    <div className="max-w-[1300px] mx-auto px-6">
      {/* Persistent Stay Dates Bar (Desktop) */}
      {checkinStr && checkoutStr && (
        <div className="hidden lg:flex relative mb-6 p-4 md:p-5 bg-white border border-neutral-100 rounded-2xl flex-col lg:flex-row lg:items-center justify-between gap-5 md:gap-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all">
          {/* Metadata Section - 2 Columns on Mobile, Row on Desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-6 gap-y-4 md:gap-x-8 text-xs">
            {/* Stay Period - Spans full width on mobile for readable horizontal dates */}
            <div className="col-span-2 flex items-center gap-3">
              <div className="p-2 bg-neutral-50 rounded-xl text-neutral-400 hidden sm:block">
                <Calendar size={15} strokeWidth={1.75} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-0.5">
                  Stay Period
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-neutral-900 flex-wrap">
                  <span>{formatDisplayDate(checkinStr)}</span>
                  <ArrowRight size={11} className="text-neutral-300 shrink-0" />
                  <span>{formatDisplayDate(checkoutStr)}</span>
                  <span className="text-neutral-400 font-normal text-[11px] ml-0.5">
                    ({calculatedNights} {calculatedNights === 1 ? "nt" : "nts"})
                  </span>
                </div>
              </div>
            </div>

            {/* Occupants */}
            <div className="flex items-center gap-3 sm:border-l sm:border-neutral-100 sm:pl-6 lg:pl-8">
              <div className="p-2 bg-neutral-50 rounded-xl text-neutral-400 hidden sm:block">
                <Users size={15} strokeWidth={1.75} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-0.5">
                  Occupants
                </span>
                <span className="font-semibold text-neutral-900">
                  {guestCount} Guests
                </span>
              </div>
            </div>

            {/* Selection Status */}
            {activeSelectedIds.length > 0 && (
              <div className="flex items-center gap-3 sm:border-l sm:border-neutral-100 sm:pl-6 lg:pl-8 animate-in fade-in duration-300">
                <div className="p-2 bg-neutral-50 rounded-xl text-neutral-400 hidden sm:block">
                  <Building size={15} strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-0.5">
                    Selection
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {activeSelectedIds.length} Selected
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Clean side-by-side row on mobile */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto border-t border-neutral-50 pt-3.5 lg:border-t-0 lg:pt-0">
            <Link
              href={`/hotel-landing-page/availability?${searchParams.toString()}`}
              className="flex-1 lg:flex-none text-center px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-xl transition-all duration-200"
            >
              Change Dates
            </Link>

            {activeSelectedIds.length > 0 && (
              <Link
                href={`/hotel-landing-page/booking?${searchParams.toString()}`}
                className="flex-[1.2] lg:flex-none group inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm"
              >
                <span className="truncate">Review Booking</span>
                <span className="flex items-center justify-center bg-white/20 text-white text-[10px] h-4 w-4 rounded-full font-bold shrink-0">
                  {activeSelectedIds.length}
                </span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Persistent Stay Dates Drawer (Mobile) */}
      {checkinStr && checkoutStr && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-100 z-50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
          <Drawer>
            <DrawerTrigger asChild>
              <button className="w-full bg-neutral-900 text-white py-3.5 rounded-xl font-semibold text-sm shadow-sm flex items-center justify-center gap-2">
                <span>View Booking Summary</span>
                {activeSelectedIds.length > 0 && (
                  <span className="flex items-center justify-center bg-white/20 text-white text-[10px] h-5 w-5 rounded-full font-bold shrink-0">
                    {activeSelectedIds.length}
                  </span>
                )}
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerTitle className="sr-only">Booking Summary</DrawerTitle>
              <DrawerDescription className="sr-only">Review your selected stay dates and occupants.</DrawerDescription>
              <div className="p-6 pb-8 max-w-md mx-auto w-full">
                <div className="grid grid-cols-2 gap-y-6">
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5 block">Stay Period</span>
                    <div className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                      <span>{formatDisplayDate(checkinStr)}</span>
                      <ArrowRight size={12} className="text-neutral-300" />
                      <span>{formatDisplayDate(checkoutStr)}</span>
                      <span className="text-neutral-400 font-normal text-xs ml-1">({calculatedNights} nts)</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5 block">Occupants</span>
                    <div className="text-sm font-semibold text-neutral-900">
                      {guestCount} Guests
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5 block">Selection</span>
                    <div className="text-sm font-semibold text-neutral-900">
                      {activeSelectedIds.length} Selected
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-8">
                  <Link
                    href={`/hotel-landing-page/availability?${searchParams.toString()}`}
                    className="flex-1 text-center px-4 py-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-sm font-semibold rounded-xl transition-all duration-200"
                  >
                    Change Dates
                  </Link>
                  <Link
                    href={activeSelectedIds.length > 0 ? `/hotel-landing-page/booking?${searchParams.toString()}` : "#"}
                    className={`flex-[1.2] group inline-flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm ${activeSelectedIds.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <span>Review Booking</span>
                    {activeSelectedIds.length > 0 && (
                      <span className="flex items-center justify-center bg-white/20 text-white text-[10px] h-5 w-5 rounded-full font-bold shrink-0">
                        {activeSelectedIds.length}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}

      {/* Active Selection Session Notification Banner */}
      {activeSelectedIds.length > 0 && (
        <div className="mb-6 p-4 bg-neutral-900 text-white rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs tracking-wide animate-in fade-in duration-300 shadow-sm">
          <p className="font-light text-neutral-300 leading-relaxed">
            Active Selection Session: You have{" "}
            <span className="font-semibold text-white">
              {activeSelectedIds.length} space(s)
            </span>{" "}
            ready. Select another card below to examine details.
          </p>
          <Link
            href={`/hotel-landing-page/booking?roomIds=${existingRoomIdsRaw}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestCount}`}
            className="underline hover:text-neutral-200 font-medium transition-colors cursor-pointer text-left shrink-0 block w-fit pt-1 md:pt-0"
          >
            Return to Checkout Summary →
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-zinc-400 block mb-2">
            Available Inventory Options
          </span>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900">
            Select Your Spaces
          </h1>
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
              activeCategory === category
                ? "bg-zinc-950 text-white shadow-sm"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/40"
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
                isAlreadySelected
                  ? "border-zinc-900 ring-1 ring-zinc-900"
                  : "border-zinc-100"
              }`}
            >
              <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                    <h3 className="font-medium text-zinc-900 text-base tracking-tight leading-snug">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 text-xs font-medium text-zinc-700 pt-0.5">
                      <Star
                        size={13}
                        className="text-amber-500 fill-amber-500"
                      />
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

                <div className="pt-5 border-t border-zinc-50 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-zinc-400 font-light block">
                      Rate / Night
                    </span>
                    <span className="text-base font-semibold text-zinc-950">
                      ₱{room.price.toLocaleString()}
                    </span>
                  </div>

                  <span className="bg-zinc-900 text-white px-3 py-1.5 rounded-full cursor-pointer text-sm font-bold transition-all duration-200 hover:bg-black flex items-center gap-1">
                    <Plus size={16} /> Reserve
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Spacer for mobile bottom bar */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}
