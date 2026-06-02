"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BedDouble,
  Users,
  SlidersHorizontal,
  Check,
  ArrowRight,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { RoomData } from "../home/types/room.types";

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface AllRoomsGridProps {
  initialRooms: RoomData[];
}

export function AllRoomsGrid({ initialRooms }: AllRoomsGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [rooms] = useState<RoomData[]>(initialRooms);
  const [activeCategory, setActiveCategory] = useState("All");

  const existingRoomIdsRaw =
    searchParams.get("roomIds") || searchParams.get("roomId") || "";
  const checkinStr = searchParams.get("checkin") || "2026-06-01";
  const checkoutStr = searchParams.get("checkout") || "2026-06-04";
  const adultsCount = Number(searchParams.get("adults") || 2);
  const childrenCount = Number(searchParams.get("children") || 0);
  const guestCount = adultsCount + childrenCount;

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
      {/* Persistent Stay Dates Bar (Desktop - Balanced Editorial Layout) */}
      {checkinStr && checkoutStr && (
        <div className="hidden lg:flex relative mb-12 border-y border-neutral-200 py-5 items-center justify-between gap-8 transition-all">
          {/* Metadata Stream */}
          <div className="flex items-center gap-x-16">
            {/* Stay Period */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Dates
              </span>
              <div className="flex items-baseline gap-2 font-serif text-lg text-zinc-900 tracking-tight">
                <span>{formatDisplayDate(checkinStr)}</span>
                <span className="text-zinc-300 font-light">—</span>
                <span>{formatDisplayDate(checkoutStr)}</span>
                <span className="text-zinc-400 text-xs font-sans tracking-normal ml-2">
                  ({calculatedNights}{" "}
                  {calculatedNights === 1 ? "night" : "nights"})
                </span>
              </div>
            </div>

            {/* Occupants */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Guests
              </span>
              <span className="font-serif text-lg text-zinc-900">
                {guestCount} Guests
              </span>
            </div>

            {/* Selection Status */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Selection
              </span>
              <span className="font-serif text-lg text-zinc-900">
                {activeSelectedIds.length > 0
                  ? `${activeSelectedIds.length} Space(s)`
                  : "None selected"}
              </span>
            </div>
          </div>

          {/* Action Buttons - Always Visible & Structured */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/hotel-landing-page/availability?${searchParams.toString()}`}
              className="px-5 py-2.5 border border-zinc-200 text-zinc-800 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors hover:bg-zinc-50 hover:border-zinc-400 rounded-sm text-center min-w-[110px]"
            >
              Edit Stay
            </Link>

            <Link
              href={
                activeSelectedIds.length > 0
                  ? `/hotel-landing-page/booking?${searchParams.toString()}`
                  : "#"
              }
              className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-200 rounded-sm text-center flex items-center justify-center gap-2 min-w-[140px]
                ${
                  activeSelectedIds.length > 0
                    ? "bg-zinc-950 text-white hover:bg-black cursor-pointer"
                    : "bg-zinc-100 text-zinc-400 pointer-events-none opacity-60"
                }`}
            >
              <span>Review Booking</span>
              {activeSelectedIds.length > 0 && (
                <span className="flex items-center justify-center bg-white/20 text-white text-[9px] h-4 min-w-[16px] px-1 rounded-xs font-mono font-bold">
                  {activeSelectedIds.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}

      {/* Persistent Stay Dates Drawer (Mobile) */}
      {checkinStr && checkoutStr && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-neutral-100 z-20 ">
          <Drawer>
            <DrawerTrigger asChild>
              <button className="w-full bg-neutral-900 text-white py-3.5 rounded-md font-semibold text-sm shadow-sm flex items-center justify-center gap-2">
                <span>Booking Details</span>
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerTitle className="sr-only">Booking Summary</DrawerTitle>
              <DrawerDescription className="sr-only">
                Review your selected stay dates and occupants.
              </DrawerDescription>
              <div className="p-6 pb-8 max-w-md mx-auto w-full">
                <div className="grid grid-cols-2 gap-y-6">
                  <div className="col-span-2">
                    <span className="text-sm font-semibold text-neutral-400 mb-1.5 block">
                      Stay Period
                    </span>
                    <div className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                      <span>{formatDisplayDate(checkinStr)}</span>
                      <ArrowRight size={12} className="text-neutral-300" />
                      <span>{formatDisplayDate(checkoutStr)}</span>
                      <span className="text-neutral-400 font-normal text-xs ml-1">
                        ({calculatedNights} nts)
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-neutral-400 mb-1.5 block">
                      Occupants
                    </span>
                    <div className="text-sm font-semibold text-neutral-900">
                      {guestCount} Guests
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-neutral-400 mb-1.5 block">
                      Selection
                    </span>
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
                    href={
                      activeSelectedIds.length > 0
                        ? `/hotel-landing-page/booking?${searchParams.toString()}`
                        : "#"
                    }
                    className={`flex-[1.2] group inline-flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm ${activeSelectedIds.length === 0 ? "opacity-50 pointer-events-none" : ""}`}
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
        <div className="mb-8 bg-zinc-950 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs tracking-wide animate-in fade-in duration-300 rounded-sm">
          
          {/* Subtle Status indicator & message */}
          <div className="flex items-center gap-3">
            <p className="font-sans text-zinc-300 font-light leading-relaxed">
              Active Selection Session — You have{" "}
              <span className="font-medium text-white">
                {activeSelectedIds.length} space(s)
              </span>{" "}
              staged. Select another option below to compare or add.
            </p>
          </div>

          {/* Minimalist Structural Link Action */}
          <Link
            href={`/hotel-landing-page/booking?roomIds=${existingRoomIdsRaw}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestCount}`}
            className="text-[10px] font-bold uppercase tracking-[0.15em] text-white hover:text-zinc-300 transition-colors cursor-pointer shrink-0 border-b border-white pb-0.5 w-fit"
          >
            Return to Checkout Summary
          </Link>
        </div>
      )}

    {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-200 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 block mb-2">
            Available Accommodations
          </span>
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-zinc-900 font-normal">
            Select Your <span className="italic font-light text-zinc-500">Spaces</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-sm w-fit">
          <SlidersHorizontal size={12} className="text-zinc-400" />
          <span>{filteredRooms.length} Options Found</span>
        </div>
      </div>

      {/* Category Pills — Clean Layout Style */}
      <div className="flex flex-wrap items-center gap-2 mb-10 pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              activeCategory === category
                ? "bg-zinc-950 text-white border-zinc-950"
                : "bg-white hover:bg-zinc-50 text-zinc-500 border-zinc-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Architectural Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {filteredRooms.map((room) => {
          const isAlreadySelected = activeSelectedIds.includes(room.id);

          return (
            <div
              key={room.id}
              onClick={() => viewRoomDetails(room.id)}
              className={`group bg-white border overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer rounded-sm ${
                isAlreadySelected
                  ? "border-zinc-950 shadow-xs"
                  : "border-zinc-200/80 hover:border-zinc-400"
              }`}
            >
              {/* Media Container Frame */}
              <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden shrink-0 border-b border-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 grayscale-[15%] group-hover:grayscale-0"
                />
                {isAlreadySelected && (
                  <span className="absolute top-3 right-3 text-[9px] uppercase font-bold tracking-[0.15em] bg-zinc-950 text-white px-2.5 py-1 rounded-sm shadow-xs flex items-center gap-1.5 animate-in fade-in duration-200">
                    <Check size={10} strokeWidth={3} /> Staged Selection
                  </span>
                )}
              </div>

              {/* Detail Content Metadata Stack */}
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-serif text-base text-zinc-900 tracking-tight leading-tight group-hover:text-zinc-600 transition-colors">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 text-[11px] font-sans font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-sm">
                      <span>★</span>
                      <span className="font-bold text-zinc-800">{room.rating}</span>
                    </div>
                  </div>

                  {/* Spec Row Details */}
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-sans tracking-wide pt-0.5">
                    <div className="flex items-center gap-1">
                      <BedDouble size={12} className="text-zinc-300" />
                      <span>{room.bed}</span>
                    </div>
                    <span className="text-zinc-200">|</span>
                    <div className="flex items-center gap-1">
                      <Users size={11} className="text-zinc-300" />
                      <span>{room.maxAdults} Adults, {room.maxChildren} Children</span>
                    </div>
                  </div>
                </div>

                {/* Card Ledger Action Footer */}
                <div className="pt-4 mt-5 border-t border-zinc-100 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                      Base Rate / Night
                    </span>
                    <span className="text-sm font-bold text-zinc-950">
                      ₱{room.price.toLocaleString()}
                    </span>
                  </div>

                  <span className={`px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-200 rounded-sm flex items-center gap-1.5
                    ${isAlreadySelected 
                      ? "bg-zinc-100 text-zinc-400 border border-zinc-200" 
                      : "bg-zinc-950 text-white hover:bg-black"
                    }`}
                  >
                    {isAlreadySelected ? "Selected" : "Reserve"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Native Mobile Spacer Area */}
      <div className="h-28 lg:hidden" />
    </div>
  );
}
