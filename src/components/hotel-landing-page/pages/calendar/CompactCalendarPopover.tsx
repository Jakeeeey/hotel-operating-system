"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Minus, X } from "lucide-react";
import { RoomType, InventoryNight, InventoryLookupMap, DayStatusCache } from "./types";

// ---------------------------------------------------------------------------
// Mock Inventory — deterministic to match GlobalCalendar
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
// Helpers
// ---------------------------------------------------------------------------
interface CalendarCell {
  dateStr: string | null;
  dayNumber: number | null;
}

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

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

// ---------------------------------------------------------------------------
// Month Pane Component
// ---------------------------------------------------------------------------
interface MonthPaneProps {
  year: number;
  month: number;
  inventoryLookup: InventoryLookupMap;
  checkInDate: string | null;
  checkOutDate: string | null;
  hoverDate: string | null;
  onCellClick: (dateStr: string) => void;
  onCellHover: (dateStr: string | null) => void;
}

function MonthPane({
  year,
  month,
  inventoryLookup,
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

      let total = 0;
      Object.values(dayRecords).forEach((r) => (total += r.remainingAvailable));
      return {
        isFullySoldOut: total === 0,
        lowInventoryAlert: total > 0 && total <= 4,
        availableRoomsCount: total,
      };
    },
    [inventoryLookup]
  );

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
    <div className="flex-1 min-w-[240px]">
      <h4 className="text-xs font-semibold text-zinc-800 tracking-tight mb-3 text-center">
        {label}
      </h4>

      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span
            key={d}
            className="text-center text-[9px] font-medium text-zinc-400 uppercase py-0.5"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          if (!cell.dateStr || !cell.dayNumber) {
            return <div key={`empty-${i}`} className="min-h-[32px]" />;
          }

          const { isFullySoldOut } = getStatus(cell.dateStr);
          const start = isStart(cell.dateStr);
          const end = isEnd(cell.dateStr);
          const inRange = isInRange(cell.dateStr);
          const isEndpoint = start || end;

          const [cy, cm, cd] = cell.dateStr.split("-").map(Number);
          const cellDate = new Date(cy, cm - 1, cd);
          const today = new Date(2026, 4, 25);
          const isPast = cellDate < today;

          return (
            <div
              key={cell.dateStr}
              className={`relative flex items-center justify-center py-0.5
                ${inRange ? "bg-zinc-100" : ""}
                ${start && rangeEnd && rangeEnd !== checkInDate ? "rounded-l-md" : ""}
                ${end && checkInDate && cell.dateStr !== checkInDate ? "rounded-r-md" : ""}
              `}
            >
              <button
                type="button"
                disabled={isFullySoldOut || isPast}
                onClick={() => onCellClick(cell.dateStr!)}
                onMouseEnter={() => onCellHover(cell.dateStr)}
                onMouseLeave={() => onCellHover(null)}
                className={`
                  relative w-full min-h-[30px] rounded-md flex flex-col items-center justify-center
                  text-[11px] font-medium transition-all duration-100
                  ${isPast || isFullySoldOut ? "text-zinc-200 cursor-not-allowed" : ""}
                  ${isEndpoint
                    ? "bg-zinc-900 text-white shadow-sm z-10 font-semibold"
                    : inRange
                    ? "text-zinc-800"
                    : !isFullySoldOut && !isPast
                    ? "hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                    : ""
                  }
                `}
              >
                <span>{cell.dayNumber}</span>
                {isFullySoldOut && !isPast && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="block w-3.5 h-px bg-zinc-300 rotate-45 rounded-full" />
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
// Main Popover Component
// ---------------------------------------------------------------------------
interface CompactCalendarPopoverProps {
  initialCheckin: string | null;
  initialCheckout: string | null;
  initialGuests: number;
  onApply: (checkin: string, checkout: string, guests: number) => void;
  onClose: () => void;
}

export function CompactCalendarPopover({
  initialCheckin,
  initialCheckout,
  initialGuests,
  onApply,
  onClose,
}: CompactCalendarPopoverProps) {
  const [checkInDate, setCheckInDate] = useState<string | null>(initialCheckin);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(initialCheckout);
  const [guestCount, setGuestCount] = useState<number>(initialGuests);

  const [leftMonth, setLeftMonth] = useState<Date>(new Date(2026, 5, 1));
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const rightMonth = useMemo(
    () => new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1),
    [leftMonth]
  );

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const inventoryLookup = useMemo<InventoryLookupMap>(() => {
    const table: InventoryLookupMap = {};
    mockInventoryDb.forEach((r) => {
      if (!table[r.date]) table[r.date] = {};
      table[r.date][r.roomType] = r;
    });
    return table;
  }, []);

  const handleCellClick = useCallback(
    (dateStr: string) => {
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

  const navigateMonths = (dir: "prev" | "next") => {
    setLeftMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + (dir === "next" ? 1 : -1));
      return next;
    });
  };

  const applyChanges = () => {
    if (checkInDate && checkOutDate) {
      onApply(checkInDate, checkOutDate, guestCount);
    }
  };

  const selectionComplete = !!checkInDate && !!checkOutDate;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-zinc-200 rounded-3xl shadow-2xl z-50 p-6 w-[95vw] max-w-[620px] animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <CalendarIcon size={14} className="text-zinc-500" />
          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
            Edit Stay Details
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Date Range & Guests Display Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 p-3 rounded-2xl border border-zinc-150 mb-5 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 mb-0.5">Check-In</span>
          <span className="font-semibold text-zinc-800">
            {checkInDate ? formatDisplayDate(checkInDate) : "Select date"}
          </span>
        </div>
        <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-zinc-200 pt-2 sm:pt-0 sm:pl-4">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 mb-0.5">Check-Out</span>
          <span className="font-semibold text-zinc-800">
            {checkOutDate ? formatDisplayDate(checkOutDate) : "Select date"}
          </span>
        </div>
        <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-l border-zinc-200 pt-2 sm:pt-0 sm:pl-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 mb-0.5">Occupants</span>
            <span className="font-semibold text-zinc-800">{guestCount} {guestCount === 1 ? "Guest" : "Guests"}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={guestCount <= 1}
              onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
              className="w-6 h-6 rounded-full border border-zinc-300 hover:border-zinc-500 flex items-center justify-center text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Minus size={10} />
            </button>
            <button
              type="button"
              disabled={guestCount >= 4}
              onClick={() => setGuestCount((g) => Math.min(4, g + 1))}
              className="w-6 h-6 rounded-full border border-zinc-300 hover:border-zinc-500 flex items-center justify-center text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Plus size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateMonths("prev")}
          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
        >
          <ChevronLeft size={13} />
        </button>

        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600">
          <span>{leftMonth.toLocaleString("en-US", { month: "short", year: "numeric" })}</span>
          <span className="text-zinc-300">—</span>
          <span>{rightMonth.toLocaleString("en-US", { month: "short", year: "numeric" })}</span>
        </div>

        <button
          type="button"
          onClick={() => navigateMonths("next")}
          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Dual Month Grids */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <MonthPane
          year={leftMonth.getFullYear()}
          month={leftMonth.getMonth()}
          inventoryLookup={inventoryLookup}
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
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          hoverDate={hoverDate}
          onCellClick={handleCellClick}
          onCellHover={setHoverDate}
        />
      </div>

      {/* Action Footer */}
      <div className="flex justify-between items-center border-t border-zinc-100 pt-4">
        <button
          type="button"
          onClick={() => {
            setCheckInDate(null);
            setCheckOutDate(null);
          }}
          className="text-xs text-zinc-500 hover:text-zinc-900 hover:underline font-semibold cursor-pointer"
        >
          Clear Dates
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectionComplete}
            onClick={applyChanges}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all
              ${selectionComplete
                ? "bg-zinc-900 hover:bg-black text-white cursor-pointer shadow-sm"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              }`}
          >
            Apply Stay
          </button>
        </div>
      </div>
    </div>
  );
}
