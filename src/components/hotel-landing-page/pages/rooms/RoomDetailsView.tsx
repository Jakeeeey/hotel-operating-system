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
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { RoomData } from "../home/types/room.types";

interface RoomDetailsViewProps {
  room: RoomData;
}

export function RoomDetailsView({ room }: RoomDetailsViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const existingRoomIdsRaw =
    searchParams.get("roomIds") || searchParams.get("roomId") || "";
  const checkinStr = searchParams.get("checkin") || "";
  const checkoutStr = searchParams.get("checkout") || "";
  const adultsCount = Number(searchParams.get("adults") || 0);
  const childrenCount = Number(searchParams.get("children") || 0);
  const guestCount = adultsCount + childrenCount;

  const activeSelectedIds = useMemo(() => {
    if (!existingRoomIdsRaw) return [];
    return existingRoomIdsRaw
      .split(",")
      .map((id) => Number(id.trim()))
      .filter(Boolean);
  }, [existingRoomIdsRaw]);

  const isAlreadySelected = activeSelectedIds.includes(room.id);

  const handleSelectionAction = () => {
    const updatedIds = new Set([...activeSelectedIds, room.id]);
    const finalQueryString = Array.from(updatedIds).join(",");
    router.push(
      `/hotel-landing-page/booking?roomIds=${finalQueryString}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestCount}`,
    );
  };

  return (
    <div className="max-w-[1300px] mx-auto px-6 font-sans">
      <Link
        href={`/hotel-landing-page/rooms?roomIds=${existingRoomIdsRaw}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestCount}`}
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors mb-8 group"
      >
        <ArrowLeft
          size={12}
          strokeWidth={2.5}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        Back to All Spaces
      </Link>

      {/* Multi-Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 rounded-sm overflow-hidden">
        <div className="md:col-span-2 aspect-[16/10] bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={room.image}
            alt={room.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden md:flex flex-col gap-4">
          <div className="h-1/2 bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={room.image}
              alt={room.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-1/2 bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={room.image}
              alt={room.name}
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
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 bg-zinc-950 text-white rounded-none">
                {room.badge}
              </span>
              <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 bg-zinc-50 text-zinc-500 border border-zinc-200">
                {room.availability}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-zinc-900">
              {room.name}
            </h1>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 bg-white p-5 border border-zinc-200 rounded-none">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                Configuration
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 uppercase tracking-wide">
                <BedDouble size={14} className="text-zinc-400" />
                <span>{room.bed}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                Max Capacity
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 uppercase tracking-wide">
                <Users size={14} className="text-zinc-400" />
                <span>{room.maxAdults} Adults, {room.maxChildren} Children</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                Rating Index
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 uppercase tracking-wide">
                <Star size={13} className="text-amber-500 fill-amber-500" />
                <span>
                  {room.rating} ({room.reviews})
                </span>
              </div>
            </div>
          </div>

          {/* Text Summary Block */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">
              About the Stay
            </h3>
            <p className="text-zinc-400 font-light leading-relaxed text-[13px] tracking-wide">
              {room.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">
              Included Premium Amenities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.amenities.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 bg-white p-3 border border-zinc-200 rounded-none text-xs text-zinc-700"
                >
                  <CheckCircle2
                    size={13}
                    strokeWidth={2.5}
                    className="text-zinc-900 shrink-0"
                  />
                  <span className="font-medium tracking-wide">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Reservation Column */}
        <div className="lg:sticky lg:top-28 bg-white border border-zinc-200 rounded-none p-6 space-y-6">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Rate per Night
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-normal text-zinc-950">
                ₱{room.price.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                / night
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="relative group/date overflow-hidden rounded-none border border-zinc-200 transition-colors">
              <div className="divide-y divide-zinc-200">
                <div className="grid grid-cols-2 divide-x divide-zinc-200">
                  <div className="p-3 bg-zinc-50/50">
                    <label className="block text-[9px] uppercase font-bold text-zinc-400 mb-1 flex items-center gap-1 tracking-widest">
                      <Calendar size={10} /> Arrival
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={checkinStr}
                      className="bg-transparent text-zinc-800 text-xs font-bold tracking-wide focus:outline-none w-full select-none"
                    />
                  </div>
                  <div className="p-3 bg-zinc-50/50">
                    <label className="block text-[9px] uppercase font-bold text-zinc-400 mb-1 flex items-center gap-1 tracking-widest">
                      <Calendar size={10} /> Departure
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={checkoutStr}
                      className="bg-transparent text-zinc-800 text-xs font-bold tracking-wide focus:outline-none w-full select-none"
                    />
                  </div>
                </div>
                <div className="p-3 bg-zinc-50/50">
                  <label className="block text-[9px] uppercase font-bold text-zinc-400 mb-1 flex items-center gap-1 tracking-widest">
                    <Users size={10} /> Occupants
                  </label>
                  <select
                    disabled
                    className="bg-transparent text-zinc-700 text-xs font-medium tracking-wide focus:outline-none w-full cursor-not-allowed"
                  >
                    <option>{guestCount} Guests Registered</option>
                  </select>
                </div>
              </div>

              {/* Edit Dates Overlay */}
              <Link
                href={`/hotel-landing-page/availability?${searchParams.toString()}`}
                className="absolute inset-0 flex items-center justify-center bg-zinc-950/5 opacity-0 group-hover/date:opacity-100 transition-opacity duration-200 backdrop-blur-[1px] cursor-pointer w-full text-center"
              >
                <span className="bg-white text-zinc-900 font-bold uppercase tracking-wider px-4 py-2 rounded-none shadow-sm text-[9px] flex items-center gap-1.5 border border-zinc-200">
                  <Calendar size={12} className="text-zinc-500" />
                  Change Dates
                </span>
              </Link>
            </div>

            {/* Smart Submission Dispatcher Actions */}
            {isAlreadySelected ? (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-none flex items-start gap-2 text-xs font-light leading-tight tracking-wide">
                  <AlertTriangle
                    size={14}
                    className="text-zinc-500 shrink-0 mt-0.5"
                  />
                  <span>
                    This suite is an active selection in your bundle. Duplicate
                    entries are disabled.
                  </span>
                </div>
                <Link
                  href={`/hotel-landing-page/booking?roomIds=${existingRoomIdsRaw}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestCount}`}
                  className="w-full py-3.5 bg-zinc-950 hover:bg-black text-white rounded-none text-[10px] font-bold text-center block uppercase tracking-[0.15em] border border-zinc-950 transition-colors"
                >
                  Return to Booking Form
                </Link>
              </div>
            ) : (
              <button
                onClick={handleSelectionAction}
                className="w-full py-3.5 bg-zinc-950 hover:bg-black text-white rounded-none text-[10px] font-bold uppercase tracking-[0.15em] border border-zinc-950 transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {activeSelectedIds.length > 0 ? (
                  <>
                    <Plus size={12} strokeWidth={2.5} /> Add to Booking
                  </>
                ) : (
                  <>Reserve</>
                )}
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <ShieldCheck size={13} className="text-zinc-400" />
            <span>Best Rate Guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
