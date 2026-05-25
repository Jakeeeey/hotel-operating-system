"use client";

import { useMemo, useCallback } from "react";
import { buildGridCells } from "./utils";
import { CalendarCell } from "./CalendarCell";
import { DayStatusCache, InventoryLookupMap, RoomType } from "./types";

interface Props {
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

export const MonthPane = ({ 
  year, month, inventoryLookup, activeCategory, 
  checkInDate, checkOutDate, hoverDate, onCellClick, onCellHover 
}: Props) => {
  // Generates cells ensuring dates format strictly as "YYYY-MM-DD"
  const cells = useMemo(() => buildGridCells(year, month), [year, month]);
  
  // Static timeline anchor (May 25, 2026)
  const todayTimestamp = useMemo(() => new Date(2026, 4, 25).getTime(), []);

  const getStatus = useCallback((dateStr: string): DayStatusCache => {
    const dayRecords = inventoryLookup[dateStr];
    
    // If lookup misses, let's provide a visible fallback number (e.g. 5) 
    // to instantly flag if your utils string formats match exactly.
    if (!dayRecords) {
      return { isFullySoldOut: false, lowInventoryAlert: false, availableRoomsCount: 0 };
    }

    if (activeCategory !== "all") {
      const target = dayRecords[activeCategory];
      const available = target ? target.remainingAvailable : 0;
      return { 
        isFullySoldOut: available === 0, 
        lowInventoryAlert: available > 0 && available <= 2, 
        availableRoomsCount: available 
      };
    }

    let total = Object.values(dayRecords).reduce((acc, r) => acc + r.remainingAvailable, 0);
    return { 
      isFullySoldOut: total === 0, 
      lowInventoryAlert: total > 0 && total <= 4, 
      availableRoomsCount: total 
    };
  }, [inventoryLookup, activeCategory]);

  const rangeEnd = checkOutDate ?? (checkInDate ? hoverDate : null);

  // Parse YYYY-MM-DD safely without standard 'new Date(str)' local midnight shifts
  const parseAbsDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).getTime();
  };

  const getIsPast = (dateStr: string) => {
    return parseAbsDate(dateStr) < todayTimestamp;
  };

  const getIsEndpoint = (dateStr: string) => {
    return (
      dateStr === checkInDate || 
      dateStr === checkOutDate ||
      (!!checkInDate && !checkOutDate && dateStr === hoverDate && dateStr !== checkInDate)
    );
  };

  const getIsInRange = (dateStr: string) => {
    if (!checkInDate || !rangeEnd) return false;
    
    const current = parseAbsDate(dateStr);
    const start = parseAbsDate(checkInDate);
    const end = parseAbsDate(rangeEnd);
    
    if (start >= end) return false;
    return current > start && current < end;
  };

  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold mb-5 text-center text-zinc-800">
        {new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" })}
      </h3>

      {/* Weekday Row Labels */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="text-center text-[10px] font-medium text-zinc-400 uppercase tracking-wider py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          if (!cell.dateStr || !cell.dayNumber) {
            return <div key={`empty-${i}`} className="min-h-[52px]" />;
          }

          const status = getStatus(cell.dateStr);

          return (
            <CalendarCell
              key={cell.dateStr}
              dateStr={cell.dateStr}
              dayNumber={cell.dayNumber}
              isPast={getIsPast(cell.dateStr)}
              isFullySoldOut={status.isFullySoldOut}
              lowInventoryAlert={status.lowInventoryAlert}
              availableRoomsCount={status.availableRoomsCount}
              isEndpoint={getIsEndpoint(cell.dateStr)}
              inRange={getIsInRange(cell.dateStr)}
              onClick={onCellClick}
              onHover={onCellHover}
            />
          );
        })}
      </div>
    </div>
  );
};