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
import { RoomType, InventoryLookupMap, InventoryNight } from "./types";
import { MonthPane } from "./MonthPane";
import { formatDisplayDate } from "./utils";
import { generateMockInventoryData } from "../../data/generateMockInventoryData";

// ---------------------------------------------------------------------------
// Inventory — sourced from mockData.ts
// ---------------------------------------------------------------------------
const mockInventoryDb: InventoryNight[] = generateMockInventoryData();

// ---------------------------------------------------------------------------
// Category pill labels
// ---------------------------------------------------------------------------
const categoryLabels: Record<RoomType, string> = {
  all: "All Rooms",
  deluxe: "Deluxe",
  suite: "Suite",
  villa: "Villa",
  overwater: "Overwater",
};

// ---------------------------------------------------------------------------
// CalendarLayout
// ---------------------------------------------------------------------------
export function CalendarLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── URL-derived state (source of truth) ──────────────────────────────────
  const checkInDate = searchParams.get("checkin");
  const checkOutDate = searchParams.get("checkout");
  const guestCount = Number(searchParams.get("guests") ?? 2);
  const activeCategory = (searchParams.get("category") ?? "all") as RoomType;
  const roomIdsRaw = searchParams.get("roomIds") || "";

  const selectedRoomsCount = useMemo(() => {
    if (!roomIdsRaw) return 0;
    return roomIdsRaw.split(",").filter(Boolean).length;
  }, [roomIdsRaw]);

  // ── Transient UI-only state ───────────────────────────────────────────────
  const [leftMonth, setLeftMonth] = useState<Date>(new Date(2026, 5, 1));
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // ── Right pane = left + 1 month ───────────────────────────────────────────
  const rightMonth = useMemo(
    () => new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1),
    [leftMonth],
  );

  // ── Build inventory lookup map ────────────────────────────────────────────
  const inventoryLookup = useMemo<InventoryLookupMap>(() => {
    const table: InventoryLookupMap = {};
    mockInventoryDb.forEach((r) => {
      if (!table[r.date]) table[r.date] = {};
      table[r.date][r.roomType] = r;
    });
    return table;
  }, []);

  // ── URL updater ───────────────────────────────────────────────────────────
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

  // ── Cell click: toggle check-in / check-out ───────────────────────────────
  const handleCellClick = useCallback(
    (dateStr: string, isUnavailable: boolean) => {
      if (isUnavailable) return;

      // No selection yet, or both already selected → start fresh
      if (!checkInDate || checkOutDate) {
        updateParams({ checkin: dateStr, checkout: null });
        return;
      }

      // Clicked before current check-in → reset check-in
      if (new Date(dateStr) < new Date(checkInDate)) {
        updateParams({ checkin: dateStr });
        return;
      }

      // Same date as check-in → do nothing
      if (dateStr === checkInDate) return;

      // Valid check-out
      updateParams({ checkout: dateStr });
    },
    [checkInDate, checkOutDate, updateParams],
  );

  // ── Category filter ───────────────────────────────────────────────────────
  const handleCategoryChange = useCallback(
    (cat: RoomType) => {
      updateParams({ category: cat, checkin: null, checkout: null });
    },
    [updateParams],
  );

  // ── Guest stepper ─────────────────────────────────────────────────────────
  const handleGuestChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(6, guestCount + delta));
    updateParams({ guests: newCount });
  };

  // ── Navigate months ───────────────────────────────────────────────────────
  const navigateMonths = (dir: "prev" | "next") => {
    setLeftMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + (dir === "next" ? 1 : -1));
      return next;
    });
  };

  // ── Search CTA ────────────────────────────────────────────────────────────
  const handleSearch = () => {
    if (!checkInDate || !checkOutDate) return;
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/hotel-landing-page/rooms?${params.toString()}`);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const calculatedNights = useMemo<number>(() => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.round(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
        86400000,
    );
  }, [checkInDate, checkOutDate]);

  const selectionComplete = !!checkInDate && !!checkOutDate;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
          Availability Calendar
        </h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-lg font-light leading-relaxed">
          Select your check-in and check-out dates to see real-time room
          availability across all categories.
        </p>
      </div>

      {/* Stay Edit Session Alert */}
      {selectedRoomsCount > 0 && (
        <div className="mb-8 p-4 md:py-3 md:px-6 bg-zinc-900 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
          {/* Left Side: Typography */}
          <div className="flex items-center gap-2.5">
            {/* Editorial active session dot */}
            <p className="text-neutral-200 font-light leading-relaxed">
              Adjusting stay dates for your selection of{" "}
              <span className="font-semibold text-white">
                {selectedRoomsCount}{" "}
                {selectedRoomsCount === 1 ? "room" : "rooms"}
              </span>
              .
            </p>
          </div>

          {/* Right Side: Clean Button Action */}
          <div className="shrink-0 w-full md:w-auto flex justify-end">
            <button
              onClick={() => updateParams({ roomIds: null })}
              className="w-full md:w-auto text-center px-4 py-2 bg-white text-zinc-900 text-[11px] font-semibold tracking-wide rounded-lg transition-all duration-200 shadow-sm cursor-pointer hover:bg-neutral-100"
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
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer
              ${
                activeCategory === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200/60"
              }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ── Calendar Panel ── */}
        <div className="xl:col-span-8 bg-white border border-zinc-200 rounded-2xl  overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <button
              onClick={() => navigateMonths("prev")}
              className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>

            <div className="flex items-center gap-6 text-sm font-medium text-zinc-600">
              <span>
                {leftMonth.toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="text-zinc-300">—</span>
              <span>
                {rightMonth.toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <button
              onClick={() => navigateMonths("next")}
              className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
            >
              <ChevronRight size={15} />
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

              {/* Divider */}
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
          <div className="px-6 py-4 border-t border-zinc-100 flex flex-wrap gap-5 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              Low availability
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-px bg-zinc-300 rotate-45 rounded-full shrink-0" />
              Sold out
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-900 shrink-0" />
              Selected
            </span>
          </div>
        </div>

        {/* ── Sidebar Panel ── */}
        <div className="xl:col-span-4 xl:sticky xl:top-28 space-y-4">
          {/* Date Summary Card */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center gap-2">
              <CalendarIcon size={14} className="text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Your Stay
              </span>
            </div>

            {/* Check-in / Check-out */}
            <div className="grid grid-cols-2 divide-x divide-zinc-100">
              <div
                className={`p-4 cursor-pointer transition-colors ${
                  !checkInDate ? "hover:bg-zinc-50" : "bg-zinc-50"
                }`}
                onClick={() => updateParams({ checkin: null, checkout: null })}
              >
                <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1">
                  Check-in
                </p>
                {checkInDate ? (
                  <p className="text-sm font-semibold text-zinc-900 leading-tight">
                    {formatDisplayDate(checkInDate)}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 font-light">
                    Select date
                  </p>
                )}
              </div>

              <div
                className={`p-4 transition-colors ${checkOutDate ? "bg-zinc-50" : ""}`}
              >
                <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1">
                  Check-out
                </p>
                {checkOutDate ? (
                  <p className="text-sm font-semibold text-zinc-900 leading-tight">
                    {formatDisplayDate(checkOutDate)}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 font-light">
                    Select date
                  </p>
                )}
              </div>
            </div>

            {/* Guest Stepper */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-zinc-400" />
                <span className="text-sm font-medium text-zinc-700">
                  Guests
                </span>
              </div>
              <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleGuestChange(-1)}
                  className="px-3 py-1.5 hover:bg-zinc-50 text-zinc-400 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-semibold w-8 text-center text-zinc-900 border-x border-zinc-200 py-1.5">
                  {guestCount}
                </span>
                <button
                  onClick={() => handleGuestChange(1)}
                  className="px-3 py-1.5 hover:bg-zinc-50 text-zinc-400 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Stay Summary */}
          {selectionComplete ? (
            <div className="rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon size={14} className="text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-600">
                    Duration
                  </span>
                </div>
                <span className="text-sm font-bold text-zinc-900">
                  {calculatedNights}{" "}
                  {calculatedNights === 1 ? "Night" : "Nights"}
                </span>
              </div>

              <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-zinc-800 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (calculatedNights / 14) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-md">
                <Check size={13} className="text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-700 font-medium">
                  Dates confirmed — ready to search
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-100 rounded-xl p-5 flex items-start gap-3">
              <Info size={14} className="text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Click a check-in date then a check-out date on the calendar to
                begin.
              </p>
            </div>
          )}

          {/* Search CTA */}
          <button
            disabled={!selectionComplete}
            onClick={handleSearch}
            className={`w-full py-3.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200
              ${
                selectionComplete
                  ? "bg-zinc-900 hover:bg-black text-white cursor-pointer shadow-sm hover:shadow-md"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              }`}
          >
            <span>Search Available Rooms</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
