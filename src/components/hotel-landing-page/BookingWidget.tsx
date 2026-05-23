"use client";

import { useState } from "react";
import { Calendar, User, ChevronDown, ArrowRight } from "lucide-react";

export function BookingWidget() {
  // Keeps your exact original filter content and state
  const [activeBookingFilter, setActiveBookingFilter] = useState<string>("All");
  const bookingFilters = ["All", "Deluxe", "Suite", "Villa", "Ocean View"];

  return (
    <div className="w-full mx-auto p-3 md:p-4">
      {/* Main card box shadow and structure padding adjustments */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-neutral-100">
        {/* ── Main Inputs Grid ──
            Changes breakdown: Locked into 2 columns on mobile, transitioning smoothly 
            to 4 columns exactly when hitting the desktop layout breakpoint (md:grid-cols-4).
        */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Check-in */}
          <div className="flex flex-col gap-1 md:gap-2 col-span-1">
            <label className="text-xs md:text-sm font-semibold text-[#111111]">
              Check-in
            </label>
            <div className="flex items-center justify-between bg-[#f5f5f5] hover:bg-[#eee] transition-colors rounded-[8px] md:rounded-[12px] px-3 md:px-4 py-2.5 md:py-3.5 cursor-pointer group">
              <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                <Calendar
                  size={16}
                  className="text-muted-foreground shrink-0"
                />
                <span className="text-[14px] md:text-[16px] font-sanss text-muted-foreground mt-0.5 truncate">
                  Add date
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-muted-foreground shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="flex flex-col gap-1 md:gap-2 col-span-1">
            <label className="text-xs md:text-sm font-semibold text-[#111111]">
              Check-out
            </label>
            <div className="flex items-center justify-between bg-[#f5f5f5] hover:bg-[#eee] transition-colors rounded-[8px] md:rounded-[12px] px-3 md:px-4 py-2.5 md:py-3.5 cursor-pointer group">
              <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                <Calendar
                  size={16}
                  className="text-muted-foreground shrink-0"
                />
                <span className="text-[14px] md:text-[16px] font-sanss text-muted-foreground mt-0.5 truncate">
                  Add date
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-muted-foreground shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>

          {/* Guests & Rooms */}
          <div className="flex flex-col gap-1 md:gap-2 col-span-2 md:col-span-1">
            <label className="text-xs md:text-sm font-semibold text-[#111111]">
              Guests & Rooms
            </label>
            <div className="flex items-center justify-between bg-[#f5f5f5] hover:bg-[#eee] transition-colors rounded-[8px] md:rounded-[12px] px-3 md:px-4 py-2.5 md:py-3.5 cursor-pointer group">
              <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                <User size={16} className="text-muted-foreground shrink-0" />
                <span className="text-[14px] md:text-[16px] font-sanss text-neutral-800 mt-0.5 truncate">
                  1 guest · 1 room
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-muted-foreground shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>

          {/* Room Type */}
          <div className="flex flex-col gap-1 md:gap-2 col-span-2 md:col-span-1">
            <label className="text-xs md:text-sm font-semibold text-[#111111]">
              Room Type
            </label>
            <div className="flex items-center justify-between bg-[#f5f5f5] hover:bg-[#eee] transition-colors rounded-[8px] md:rounded-[12px] px-3 md:px-4 py-2.5 md:py-3.5 cursor-pointer group">
              <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                <span className="text-[14px] md:text-[16px] font-sanss text-neutral-800 mt-0.5 truncate">
                  All Rooms
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-muted-foreground shrink-0 transition-transform group-hover:translate-y-px"
              />
            </div>
          </div>
        </div>

        {/* ── Bottom Action Row ── */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mt-4 md:mt-6 gap-4">
          {/* Quick Filters Group */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 min-w-0">
            <span className="text-xs md:text-sm font-semibold text-[#111111] shrink-0">
              Filter:
            </span>
            {/* Added scrollbar-none to hide standard desktop bars while maintaining responsive swipe tracking */}
            <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0 scroll-smooth w-full">
              {bookingFilters.map((filter) => {
                const isActive = activeBookingFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveBookingFilter(filter)}
                    className={`rounded-full px-3 md:px-4 py-1 md:py-1.5 text-xs font-semibold border transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                        : "bg-white text-[#555555] border-[#e5e5e5] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Button */}
          <button className="w-full md:w-auto bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-[8px] md:rounded-[10px] px-5 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 md:ml-auto shadow-sm shrink-0 cursor-pointer">
            <span>Search</span>
            <ArrowRight size={15} className="md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
