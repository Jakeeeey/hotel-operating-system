"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  ArrowRight,
  Info,
  Check,
  Moon,
  Minus,
  Plus,
} from "lucide-react";
import { RoomType, InventoryLookupMap, InventoryNight } from "./types/types";
import { MonthPane } from "./components/MonthPane";
import { formatDisplayDate } from "./utils/utils";
import { generateMockInventoryData } from "../../data/generateMockInventoryData";

const mockInventoryDb: InventoryNight[] = generateMockInventoryData();

const categoryLabels: Record<RoomType, string> = {
  all: "All Rooms",
  deluxe: "Deluxe",
  suite: "Suite",
  villa: "Villa",
  overwater: "Overwater",
};

export function CalendarLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const checkInDate = searchParams.get("checkin");
  const checkOutDate = searchParams.get("checkout");
  const guestCount = Number(searchParams.get("guests") ?? 2);
  const activeCategory = (searchParams.get("category") ?? "all") as RoomType;
  const roomIdsRaw = searchParams.get("roomIds") || "";

  const selectedRoomsCount = useMemo(() => {
    if (!roomIdsRaw) return 0;
    return roomIdsRaw.split(",").filter(Boolean).length;
  }, [roomIdsRaw]);

  const [leftMonth, setLeftMonth] = useState<Date>(new Date(2026, 5, 1));
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const rightMonth = useMemo(
    () => new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1),
    [leftMonth],
  );

  const inventoryLookup = useMemo<InventoryLookupMap>(() => {
    const table: InventoryLookupMap = {};
    mockInventoryDb.forEach((r) => {
      if (!table[r.date]) table[r.date] = {};
      table[r.date][r.roomType] = r;
    });
    return table;
  }, []);

  const updateParams = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === null) params.delete(key);
        else params.set(key, String(val));
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const handleCellClick = useCallback(
    (dateStr: string, isUnavailable: boolean) => {
      if (isUnavailable) return;
      if (!checkInDate || checkOutDate) {
        updateParams({ checkin: dateStr, checkout: null });
        return;
      }
      if (new Date(dateStr) < new Date(checkInDate)) {
        updateParams({ checkin: dateStr });
        return;
      }
      if (dateStr === checkInDate) return;
      updateParams({ checkout: dateStr });
    },
    [checkInDate, checkOutDate, updateParams],
  );

  const handleCategoryChange = useCallback(
    (cat: RoomType) => {
      updateParams({ category: cat, checkin: null, checkout: null });
    },
    [updateParams],
  );

  const handleGuestChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(6, guestCount + delta));
    updateParams({ guests: newCount });
  };

  const navigateMonths = (dir: "prev" | "next") => {
    setLeftMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + (dir === "next" ? 1 : -1));
      return next;
    });
  };

  const handleSearch = () => {
    if (!checkInDate || !checkOutDate) return;
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/hotel-landing-page/rooms?${params.toString()}`);
  };

  const calculatedNights = useMemo<number>(() => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.round(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
        86400000,
    );
  }, [checkInDate, checkOutDate]);

  const selectionComplete = !!checkInDate && !!checkOutDate;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-zinc-900">
          Availability Calendar
        </h1>
        <p className="text-[13px] text-zinc-400 mt-2 max-w-lg font-light leading-relaxed tracking-wide">
          Select check-in and check-out dates to view real-time reservation indices across all space categories.
        </p>
      </div>

      {/* Stay Edit Session Alert */}
      {selectedRoomsCount > 0 && (
        <div className="mb-8 p-4 bg-zinc-950 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs tracking-wide border border-zinc-950">
          <div className="flex items-center gap-2.5">
            <p className="text-zinc-300 font-light">
              Adjusting stay dates for your selection of{" "}
              <span className="font-bold text-white uppercase tracking-wider">
                {selectedRoomsCount} {selectedRoomsCount === 1 ? "room" : "rooms"}
              </span>
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto flex justify-end">
            <button
              onClick={() => updateParams({ roomIds: null })}
              className="w-full md:w-auto text-center px-4 py-2 bg-white text-zinc-950 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer hover:bg-zinc-100"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        {(Object.keys(categoryLabels) as RoomType[]).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
              activeCategory === cat
                ? "bg-zinc-950 text-white border-zinc-950"
                : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ── Calendar Panel ── */}
        <div className="xl:col-span-8 bg-white border border-zinc-200 rounded-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <button
              onClick={() => navigateMonths("prev")}
              className="p-2 rounded-sm border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-800">
              <span>{leftMonth.toLocaleString("en-US", { month: "short", year: "numeric" })}</span>
              <span className="text-zinc-300 font-normal">—</span>
              <span>{rightMonth.toLocaleString("en-US", { month: "short", year: "numeric" })}</span>
            </div>

            <button
              onClick={() => navigateMonths("next")}
              className="p-2 rounded-sm border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
            >
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Dual Month Grid */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-8">
              <MonthPane
                year={leftMonth.getFullYear()}
                month={leftMonth.getMonth()}
                inventoryLookup={inventoryLookup}
                activeCategory={activeCategory}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                hoverDate={hoverDate}
                onCellClick={handleCellClick}
                onCellHover={setHoverDate}
              />

              <div className="hidden sm:block w-px bg-zinc-100 self-stretch" />

              <MonthPane
                year={rightMonth.getFullYear()}
                month={rightMonth.getMonth()}
                inventoryLookup={inventoryLookup}
                activeCategory={activeCategory}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                hoverDate={hoverDate}
                onCellClick={handleCellClick}
                onCellHover={setHoverDate}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="px-6 py-4 border-t border-zinc-100 flex flex-wrap gap-5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 shrink-0" />
              Available
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-none bg-amber-500 shrink-0" />
              Low Stock
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-[1.5px] bg-zinc-300 rotate-45 shrink-0" />
              Sold Out
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-none bg-zinc-950 shrink-0" />
              Selected
            </span>
          </div>
        </div>

        {/* ── Sidebar Panel ── */}
        <div className="xl:col-span-4 xl:sticky xl:top-28 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center gap-2 bg-zinc-50/50">
              <CalendarIcon size={13} className="text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                Reservation Details
              </span>
            </div>

            {/* Check-in / Check-out */}
            <div className="grid grid-cols-2 divide-x divide-zinc-200 border-b border-zinc-200">
              <div
                className={`p-4 cursor-pointer transition-colors ${!checkInDate ? "hover:bg-zinc-50/80" : "bg-zinc-50/30"}`}
                onClick={() => updateParams({ checkin: null, checkout: null })}
              >
                <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 mb-1">
                  Arrival
                </p>
                {checkInDate ? (
                  <p className="text-xs font-bold text-zinc-950 tracking-wide">
                    {formatDisplayDate(checkInDate)}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 font-light tracking-wide">Select date</p>
                )}
              </div>

              <div className={`p-4 ${checkOutDate ? "bg-zinc-50/30" : ""}`}>
                <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 mb-1">
                  Departure
                </p>
                {checkOutDate ? (
                  <p className="text-xs font-bold text-zinc-950 tracking-wide">
                    {formatDisplayDate(checkOutDate)}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 font-light tracking-wide">Select date</p>
                )}
              </div>
            </div>

            {/* Guest Stepper */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users size={14} className="text-zinc-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Guests
                </span>
              </div>
              <div className="flex items-center border border-zinc-200 rounded-sm overflow-hidden">
                <button
                  onClick={() => handleGuestChange(-1)}
                  className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-400 transition-colors"
                >
                  <Minus size={12} strokeWidth={2.5} />
                </button>
                <span className="text-xs font-bold w-8 text-center text-zinc-900 border-x border-zinc-200 py-1.5">
                  {guestCount}
                </span>
                <button
                  onClick={() => handleGuestChange(1)}
                  className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-400 transition-colors"
                >
                  <Plus size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Stay Summary */}
          {selectionComplete ? (
            <div className="border border-zinc-200 rounded-sm p-4 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon size={13} className="text-zinc-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Duration 
                  </span>
                </div>
                <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                  {calculatedNights} {calculatedNights === 1 ? "Night" : "Nights"}
                </span>
              </div>

              <div className="w-full bg-zinc-100 rounded-none h-1 overflow-hidden">
                <div
                  className="bg-zinc-950 h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (calculatedNights / 14) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-sm">
                <Check size={12} className="text-emerald-600 shrink-0" strokeWidth={3} />
                <span className="text-[11px] text-zinc-600 font-medium tracking-wide">
                  Timeline verified — interface unlocked.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-zinc-200 rounded-sm p-4 flex items-start gap-3">
              <Info size={13} className="text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-400 font-light leading-relaxed tracking-wide">
                Establish an arrival marker, followed by a departure node on the grid track to query available keys.
              </p>
            </div>
          )}

          {/* Search CTA */}
          <button
            disabled={!selectionComplete}
            onClick={handleSearch}
            className={`w-full py-3.5 rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all border ${
              selectionComplete
                ? "bg-zinc-950 border-zinc-950 text-white cursor-pointer hover:bg-black"
                : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
            }`}
          >
            <span>Check Availability</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}