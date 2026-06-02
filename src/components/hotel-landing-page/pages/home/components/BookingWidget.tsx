"use client";

import { Calendar, User, ChevronDown, ArrowRight } from "lucide-react";

export function BookingWidget() {
  return (
    <div className="w-full mx-auto p-0">
      {/* Main architectural ledger frame with minimal lines */}
      <div className="bg-white rounded-xl p-5 md:p-6  shadow-xl shadow-zinc-950/5">
        
        {/* ── Main Inputs Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          
          {/* Check-in */}
          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="text-[9px] font-bold tracking-[0.15em] text-zinc-400 uppercase font-sans">
              Check-in
            </label>
            <div className="flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200/80 transition-colors rounded-sm px-3 md:px-4 py-3 cursor-pointer group">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar
                  size={14}
                  className="text-zinc-400 shrink-0 group-hover:text-zinc-600 transition-colors"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-sans truncate">
                  Add date
                </span>
              </div>
              <ChevronDown
                size={13}
                className="text-zinc-400 shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="text-[9px] font-bold tracking-[0.15em] text-zinc-400 uppercase font-sans">
              Check-out
            </label>
            <div className="flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200/80 transition-colors rounded-sm px-3 md:px-4 py-3 cursor-pointer group">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar
                  size={14}
                  className="text-zinc-400 shrink-0 group-hover:text-zinc-600 transition-colors"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-sans truncate">
                  Add date
                </span>
              </div>
              <ChevronDown
                size={13}
                className="text-zinc-400 shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>

          {/* Guests & Rooms */}
          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
            <label className="text-[9px] font-bold tracking-[0.15em] text-zinc-400 uppercase font-sans">
              Occupancy
            </label>
            <div className="flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200/80 transition-colors rounded-sm px-3 md:px-4 py-3 cursor-pointer group">
              <div className="flex items-center gap-2 min-w-0">
                <User size={14} className="text-zinc-400 shrink-0 group-hover:text-zinc-600 transition-colors" />
                <span className="text-xs font-semibold text-zinc-800 font-sans truncate">
                  1 Guest <span className="text-zinc-300 px-0.5">|</span> 1 Room
                </span>
              </div>
              <ChevronDown
                size={13}
                className="text-zinc-400 shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>

          {/* Room Type */}
          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
            <label className="text-[9px] font-bold tracking-[0.15em] text-zinc-400 uppercase font-sans">
              Tier Level
            </label>
            <div className="flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200/80 transition-colors rounded-sm px-3 md:px-4 py-3 cursor-pointer group">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-zinc-800 font-sans truncate">
                  All Room Classes
                </span>
              </div>
              <ChevronDown
                size={13}
                className="text-zinc-400 shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>
        </div>

        {/* ── Bottom Action Row ── */}
        <div className="flex justify-end mt-5 md:mt-6">
          <button className="w-full md:w-auto min-w-[180px] bg-zinc-950 text-white rounded-sm px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-150 hover:bg-black flex items-center justify-center gap-2 shadow-xs cursor-pointer group/btn">
            <span>Check Availability</span>
            <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}