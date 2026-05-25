"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  ArrowRight,
  ShieldCheck,
  Info,
  Check,
  Moon,
} from "lucide-react";
import {
  DayStatusCache,
  InventoryNight,
  RoomType,
  InventoryLookupMap,
} from "./types";

// ---------------------------------------------------------------------------
// Mock Inventory — deterministic to avoid SSR hydration mismatch
// ---------------------------------------------------------------------------
const generateMockInventoryData = (): InventoryNight[] => {
  const data: InventoryNight[] = [];
  const roomTypes: Exclude<RoomType, "all">[] = [
    "deluxe",
    "suite",
    "villa",
    "overwater",
  ];
  const totalCounts: Record<Exclude<RoomType, "all">, number> = {
    deluxe: 12,
    suite: 8,
    villa: 4,
    overwater: 3,
  };

  // Cover June → September 2026
  const months = [
    { month: 5, days: 30 },
    { month: 6, days: 31 },
    { month: 7, days: 31 },
    { month: 8, days: 30 },
  ];

  months.forEach(({ month, days }) => {
    for (let day = 1; day <= days; day++) {
      const dateString = `2026-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      roomTypes.forEach((type) => {
        const seedStr = `${dateString}-${type}`;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
          hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const pseudoRandom = Math.abs(hash % 100) / 100;
        let allocated = Math.floor(pseudoRandom * (totalCounts[type] - 1));

        const dayOfWeek = new Date(2026, month, day).getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6) {
          allocated = Math.min(totalCounts[type], allocated + 3);
        }

        // Blackout block: June 12-14
        if (month === 5 && day >= 12 && day <= 14) {
          allocated = totalCounts[type];
        }

        data.push({
          date: dateString,
          roomType: type,
          totalInventory: totalCounts[type],
          allocatedCount: allocated,
          remainingAvailable: totalCounts[type] - allocated,
        });
      });
    }
  });

  return data;
};

const mockInventoryDb: InventoryNight[] = generateMockInventoryData();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CalendarCell {
  dateStr: string | null;
  dayNumber: number | null;
}

// ---------------------------------------------------------------------------
// Helper — build calendar grid for a given year/month
// ---------------------------------------------------------------------------
function buildGridCells(year: number, month: number): CalendarCell[] {
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ dateStr: null, dayNumber: null });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({
      dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      dayNumber: d,
    });
  }
  return cells;
}

// ---------------------------------------------------------------------------
// Helper — format date for display
// ---------------------------------------------------------------------------
function formatDisplayDate(iso: string): string {
  // Parse manually to avoid timezone shift
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Sub-component — single month pane
// ---------------------------------------------------------------------------
interface MonthPaneProps {
  year: number;
  month: number;
  inventoryLookup: InventoryLookupMap;
  activeCategory: RoomType;
  checkInDate: string | null;
  checkOutDate: string | null;
  hoverDate: string | null;
  onCellClick: (dateStr: string, isSoldOut: boolean) => void;
  onCellHover: (dateStr: string | null) => void;
}

function MonthPane({
  year,
  month,
  inventoryLookup,
  activeCategory,
  checkInDate,
  checkOutDate,
  hoverDate,
  onCellClick,
  onCellHover,
}: MonthPaneProps) {
  const cells = useMemo(() => buildGridCells(year, month), [year, month]);

  const label = new Date(year, month).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getStatus = useCallback(
    (dateStr: string): DayStatusCache => {
      const dayRecords = inventoryLookup[dateStr];
      if (!dayRecords) {
        return {
          isFullySoldOut: false,
          lowInventoryAlert: false,
          availableRoomsCount: 0,
        };
      }

      if (activeCategory !== "all") {
        const target = dayRecords[activeCategory];
        const available = target ? target.remainingAvailable : 0;
        return {
          isFullySoldOut: available === 0,
          lowInventoryAlert: available > 0 && available <= 2,
          availableRoomsCount: available,
        };
      }

      let total = 0;
      Object.values(dayRecords).forEach((r) => (total += r.remainingAvailable));
      return {
        isFullySoldOut: total === 0,
        lowInventoryAlert: total > 0 && total <= 4,
        availableRoomsCount: total,
      };
    },
    [inventoryLookup, activeCategory]
  );

  // Effective end for range highlight (checkout or hover)
  const rangeEnd = checkOutDate ?? (checkInDate ? hoverDate : null);

  const isInRange = (dateStr: string): boolean => {
    if (!checkInDate || !rangeEnd) return false;
    const d = new Date(dateStr);
    const start = new Date(checkInDate);
    const end = new Date(rangeEnd);
    if (start >= end) return false;
    return d > start && d < end;
  };

  const isStart = (dateStr: string) => dateStr === checkInDate;
  const isEnd = (dateStr: string) =>
    dateStr === checkOutDate ||
    (!!checkInDate && !checkOutDate && dateStr === hoverDate && dateStr !== checkInDate);

  return (
    <div className="flex-1 min-w-0">
      {/* Month label */}
      <h3 className="text-sm font-semibold text-zinc-800 tracking-tight mb-5 text-center">
        {label}
      </h3>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span
            key={d}
            className="text-center text-[10px] font-medium text-zinc-400 uppercase tracking-wider py-1"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          if (!cell.dateStr || !cell.dayNumber) {
            return <div key={`empty-${i}`} className="min-h-[52px]" />;
          }

          const { isFullySoldOut, lowInventoryAlert, availableRoomsCount } = getStatus(cell.dateStr);
          const start = isStart(cell.dateStr);
          const end = isEnd(cell.dateStr);
          const inRange = isInRange(cell.dateStr);
          const isEndpoint = start || end;

          // Today
          const [cy, cm, cd] = cell.dateStr.split("-").map(Number);
          const cellDate = new Date(cy, cm - 1, cd);
          const today = new Date(2026, 4, 25); // pinned to avoid hydration mismatch
          const isPast = cellDate < today;

          return (
            <div
              key={cell.dateStr}
              className={`relative flex items-center justify-center
                ${inRange ? "bg-zinc-100" : ""}
                ${start && rangeEnd && rangeEnd !== checkInDate ? "rounded-l-lg" : ""}
                ${end && checkInDate && cell.dateStr !== checkInDate ? "rounded-r-lg" : ""}
              `}
            >
              <button
                disabled={isFullySoldOut || isPast}
                onClick={() => onCellClick(cell.dateStr!, isFullySoldOut || isPast)}
                onMouseEnter={() => onCellHover(cell.dateStr)}
                onMouseLeave={() => onCellHover(null)}
                className={`
                  relative w-full min-h-[52px] rounded-lg flex flex-col items-start justify-between
                  p-1.5 text-xs font-medium transition-all duration-150
                  ${isPast ? "text-zinc-300 cursor-not-allowed" : ""}
                  ${isFullySoldOut && !isPast ? "text-zinc-300 cursor-not-allowed" : ""}
                  ${isEndpoint
                    ? "bg-zinc-900 text-white shadow-md z-10"
                    : inRange
                    ? "bg-transparent text-zinc-800"
                    : !isFullySoldOut && !isPast
                    ? "hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                    : ""
                  }
                `}
              >
                {/* Day number */}
                <span className="leading-none font-medium">{cell.dayNumber}</span>

                {/* Availability count text — left aligned */}
                {!isFullySoldOut && !isPast && !isEndpoint && (
                  <span
                    className={`text-[9px] font-semibold leading-none
                      ${lowInventoryAlert ? "text-amber-500" : "text-emerald-500"}
                    `}
                  >
                    {lowInventoryAlert ? "Low" : `${availableRoomsCount} left`}
                  </span>
                )}

                {/* Endpoint availability hint */}
                {isEndpoint && !isFullySoldOut && (
                  <span className="text-[9px] font-medium leading-none text-zinc-400">
                    {start ? "In" : "Out"}
                  </span>
                )}

                {/* Sold-out slash overlay */}
                {isFullySoldOut && !isPast && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="block w-5 h-px bg-zinc-300 rotate-45 rounded-full" />
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function GlobalCalendar() {
  const router = useRouter();

  const [leftMonth, setLeftMonth] = useState<Date>(new Date(2026, 5, 1));
  const [activeCategory, setActiveCategory] = useState<RoomType>("all");
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState<number>(2);

  // Right pane = left + 1 month
  const rightMonth = useMemo(
    () => new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1),
    [leftMonth]
  );

  const inventoryLookup = useMemo<InventoryLookupMap>(() => {
    const table: InventoryLookupMap = {};
    mockInventoryDb.forEach((r) => {
      if (!table[r.date]) table[r.date] = {};
      table[r.date][r.roomType] = r;
    });
    return table;
  }, []);

  const handleCellClick = useCallback(
    (dateStr: string, isUnavailable: boolean) => {
      if (isUnavailable) return;

      if (!checkInDate || checkOutDate) {
        setCheckInDate(dateStr);
        setCheckOutDate(null);
        return;
      }

      if (new Date(dateStr) < new Date(checkInDate)) {
        setCheckInDate(dateStr);
        return;
      }

      if (dateStr === checkInDate) return;

      setCheckOutDate(dateStr);
    },
    [checkInDate, checkOutDate]
  );

  const calculatedNights = useMemo<number>(() => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.round(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
        86400000
    );
  }, [checkInDate, checkOutDate]);

  const navigateMonths = (dir: "prev" | "next") => {
    setLeftMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + (dir === "next" ? 1 : -1));
      return next;
    });
  };

  const handleSearch = () => {
    if (!checkInDate || !checkOutDate) return;
    router.push(
      `/hotel-landing-page/rooms?checkin=${checkInDate}&checkout=${checkOutDate}&guests=${guestCount}`
    );
  };

  const categoryLabels: Record<RoomType, string> = {
    all: "All Rooms",
    deluxe: "Deluxe",
    suite: "Suite",
    villa: "Villa",
    overwater: "Overwater",
  };

  const selectionComplete = !!checkInDate && !!checkOutDate;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">

      {/* Page Header */}
      <div className="mb-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-zinc-400 mb-3">
          <span className="w-4 h-px bg-zinc-300 inline-block" />
          Live Resort Inventory
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
          Availability Calendar
        </h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-lg font-light leading-relaxed">
          Select your check-in and check-out dates to see real-time room availability across all categories.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        {(Object.keys(categoryLabels) as RoomType[]).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setCheckInDate(null);
              setCheckOutDate(null);
            }}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer
              ${activeCategory === cat
                ? "bg-zinc-900 text-white shadow-sm"
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
        <div className="xl:col-span-8 bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Calendar Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <button
              onClick={() => navigateMonths("prev")}
              className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>

            <div className="flex items-center gap-6 text-sm font-medium text-zinc-600">
              <span>
                {leftMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
              </span>
              <span className="text-zinc-300">—</span>
              <span>
                {rightMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>

            <button
              onClick={() => navigateMonths("next")}
              className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
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
          <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
              <CalendarIcon size={14} className="text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Your Stay
              </span>
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-2 divide-x divide-zinc-100">
              <div
                className={`p-4 cursor-pointer transition-colors
                  ${!checkInDate ? "hover:bg-zinc-50" : "bg-zinc-50"}`}
                onClick={() => {
                  setCheckInDate(null);
                  setCheckOutDate(null);
                }}
              >
                <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1">
                  Check-in
                </p>
                {checkInDate ? (
                  <p className="text-sm font-semibold text-zinc-900 leading-tight">
                    {formatDisplayDate(checkInDate)}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 font-light">Select date</p>
                )}
              </div>

              <div className={`p-4 transition-colors ${checkOutDate ? "bg-zinc-50" : ""}`}>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1">
                  Check-out
                </p>
                {checkOutDate ? (
                  <p className="text-sm font-semibold text-zinc-900 leading-tight">
                    {formatDisplayDate(checkOutDate)}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 font-light">Select date</p>
                )}
              </div>
            </div>

            {/* Guests */}
            <div className="px-4 py-3.5 border-t border-zinc-100 flex items-center gap-3">
              <Users size={13} className="text-zinc-400 shrink-0" />
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="flex-1 text-xs text-zinc-700 font-medium bg-transparent focus:outline-none cursor-pointer"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests</option>
              </select>
            </div>
          </div>

          {/* Stay Summary */}
          {selectionComplete ? (
            <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon size={14} className="text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-600">Duration</span>
                </div>
                <span className="text-sm font-bold text-zinc-900">
                  {calculatedNights} {calculatedNights === 1 ? "Night" : "Nights"}
                </span>
              </div>

              <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-zinc-800 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (calculatedNights / 14) * 100)}%` }}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <Check size={13} className="text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-700 font-medium">
                  Dates confirmed — ready to search
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-5 flex items-start gap-3">
              <Info size={14} className="text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Click a check-in date then a check-out date on the calendar to begin.
              </p>
            </div>
          )}

          {/* CTA */}
          <button
            disabled={!selectionComplete}
            onClick={handleSearch}
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200
              ${selectionComplete
                ? "bg-zinc-900 hover:bg-black text-white cursor-pointer shadow-sm hover:shadow-md"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              }`}
          >
            <span>Search Available Rooms</span>
            <ArrowRight size={15} />
          </button>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-light py-1">
            <ShieldCheck size={13} className="text-zinc-400" />
            <span>Synced with live inventory · No payment now</span>
          </div>
        </div>
      </div>
    </div>
  );
}