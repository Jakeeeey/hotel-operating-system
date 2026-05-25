"use client";

import { Calendar, User, ChevronDown, ArrowRight } from "lucide-react";

export function BookingWidget() {
  return (
    <div className="w-full mx-auto p-3 md:p-4">
      {/* Main card with enhanced modern shadow and border details */}
      <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-[0_16px_48px_rgba(0,0,0,0.08)] border border-neutral-100">
        
        {/* ── Main Inputs Grid ──
            Optimized for 2 columns on mobile and 4 columns on desktop layouts.
        */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          
          {/* Check-in */}
          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="text-xs font-semibold tracking-wide text-neutral-800 uppercase">
              Check-in
            </label>
            <div className="flex items-center justify-between bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 transition-colors rounded-[12px] px-3 md:px-4 py-3 cursor-pointer group">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar
                  size={16}
                  className="text-neutral-400 shrink-0 group-hover:text-neutral-600 transition-colors"
                />
                <span className="text-sm font-medium text-neutral-500 truncate">
                  Add date
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-neutral-400 shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="text-xs font-semibold tracking-wide text-neutral-800 uppercase">
              Check-out
            </label>
            <div className="flex items-center justify-between bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 transition-colors rounded-[12px] px-3 md:px-4 py-3 cursor-pointer group">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar
                  size={16}
                  className="text-neutral-400 shrink-0 group-hover:text-neutral-600 transition-colors"
                />
                <span className="text-sm font-medium text-neutral-500 truncate">
                  Add date
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-neutral-400 shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>

          {/* Guests & Rooms */}
          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-semibold tracking-wide text-neutral-800 uppercase">
              Guests & Rooms
            </label>
            <div className="flex items-center justify-between bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 transition-colors rounded-[12px] px-3 md:px-4 py-3 cursor-pointer group">
              <div className="flex items-center gap-2 min-w-0">
                <User size={16} className="text-neutral-400 shrink-0 group-hover:text-neutral-600 transition-colors" />
                <span className="text-sm font-medium text-neutral-800 truncate">
                  1 guest · 1 room
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-neutral-400 shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>

          {/* Room Type */}
          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-semibold tracking-wide text-neutral-800 uppercase">
              Room Type
            </label>
            <div className="flex items-center justify-between bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 transition-colors rounded-[12px] px-3 md:px-4 py-3 cursor-pointer group">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-neutral-800 truncate">
                  All Rooms
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-neutral-400 shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>
        </div>

        {/* ── Bottom Action Row ── */}
        <div className="flex justify-end mt-5 md:mt-6">
          <button className="w-full md:w-auto min-w-[160px] bg-neutral-900 hover:bg-neutral-800 text-white rounded-[12px] px-6 py-3.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer">
            <span>Book Now</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}