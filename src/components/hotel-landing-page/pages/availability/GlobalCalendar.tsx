"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  Check
} from "lucide-react";
import { DayStatusCache, InventoryNight, RoomType, InventoryLookupMap } from "./types";

// Generates comprehensive dynamic inventory mock arrays across June & July 2026 deterministically to prevent hydration mismatch
const generateMockInventoryData = (): InventoryNight[] => {
  const data: InventoryNight[] = [];
  const roomTypes: Exclude<RoomType, "all">[] = ["deluxe", "suite", "villa", "overwater"];
  const totalCounts: Record<Exclude<RoomType, "all">, number> = {
    deluxe: 12,
    suite: 8,
    villa: 4,
    overwater: 3
  };

  // Build dates across June (30 days) and July (31 days) 2026
  const targetedMonths = [
    { month: 5, days: 30 }, // June (0-indexed base date helper = 5)
    { month: 6, days: 31 }  // July
  ];

  targetedMonths.forEach(({ month, days }) => {
    for (let day = 1; day <= days; day++) {
      const dateString = `2026-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      roomTypes.forEach((type) => {
        // Simple deterministic hash function based on date string and room type
        const seedStr = `${dateString}-${type}`;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
          hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const pseudoRandom = Math.abs(hash % 100) / 100; // Value between 0 and 0.99
        let allocated = Math.floor(pseudoRandom * (totalCounts[type] - 1));
        
        // Simulating artificial high-demand sold out weekends (Fridays/Saturdays)
        const dayOfWeek = new Date(2026, month, day).getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6) {
          allocated = Math.min(totalCounts[type], allocated + 3);
        }

        // Hardcoding a complete blackout sold-out block for testing (June 12 - June 14)
        if (month === 5 && day >= 12 && day <= 14) {
          allocated = totalCounts[type];
        }

        data.push({
          date: dateString,
          roomType: type,
          totalInventory: totalCounts[type],
          allocatedCount: allocated,
          remainingAvailable: totalCounts[type] - allocated
        });
      });
    }
  });

  return data;
};

const mockInventoryDb: InventoryNight[] = generateMockInventoryData();

export function GlobalCalendar() {
  const router = useRouter();
  
  // Date tracking viewport states
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1)); // Starts at June 2026
  const [activeCategory, setActiveCategory] = useState<RoomType>("all");
  
  // Selection ranges parameters
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState<number>(2);

  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();

  // Create an indexed, cached O(1) table map representing [date][roomType] records
  const inventoryLookupTable = useMemo<InventoryLookupMap>(() => {
    const table: InventoryLookupMap = {};
    mockInventoryDb.forEach((record) => {
      if (!table[record.date]) {
        table[record.date] = {};
      }
      table[record.date][record.roomType] = record;
    });
    return table;
  }, []);

  // Generate dynamic day structural objects inside the month viewport grid block
  const calendarGridCells = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    
    const elements: { dateStr: string | null; dayNumber: number | null }[] = [];
    
    // Fill empty padding grids leading up to first weekday
    for (let i = 0; i < firstDayIndex; i++) {
      elements.push({ dateStr: null, dayNumber: null });
    }
    
    // Build actual calendar calendar numbers
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      elements.push({ dateStr, dayNumber: day });
    }
    
    return elements;
  }, [viewYear, viewMonth]);

  // Compute availability calculations for a targeted calendar date cell
  const getDateStatus = (dateStr: string): DayStatusCache => {
    const dayRecords = inventoryLookupTable[dateStr];
    if (!dayRecords) {
      return { isFullySoldOut: false, lowInventoryAlert: false, availableRoomsCount: 0 };
    }

    if (activeCategory !== "all") {
      const targetRoom = dayRecords[activeCategory];
      const available = targetRoom ? targetRoom.remainingAvailable : 0;
      return {
        isFullySoldOut: available === 0,
        lowInventoryAlert: available > 0 && available <= 2,
        availableRoomsCount: available
      };
    } else {
      // "All" filter aggregations loop calculations
      let globalAvailable = 0;
      let totalCategoriesAvailable = 0;
      
      Object.values(dayRecords).forEach((room) => {
        globalAvailable += room.remainingAvailable;
        if (room.remainingAvailable > 0) totalCategoriesAvailable++;
      });

      return {
        isFullySoldOut: globalAvailable === 0,
        lowInventoryAlert: globalAvailable > 0 && globalAvailable <= 4,
        availableRoomsCount: globalAvailable
      };
    }
  };

  // Manage cell clicks inside the user selection timeline sequence
  const handleCellSelection = (dateStr: string, isSoldOut: boolean) => {
    if (isSoldOut) return;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(dateStr);
      setCheckOutDate(null);
    } else if (checkInDate && !checkOutDate) {
      if (new Date(dateStr) < new Date(checkInDate)) {
        setCheckInDate(dateStr);
      } else if (dateStr === checkInDate) {
        // Can't checkout same day
        return;
      } else {
        setCheckOutDate(dateStr);
      }
    }
  };

  // Validation checking helper determining highlighted states
  const verifyDayIsHighlighted = (dateStr: string): boolean => {
    if (!dateStr) return false;
    if (dateStr === checkInDate || dateStr === checkOutDate) return true;
    if (checkInDate && checkOutDate) {
      const current = new Date(dateStr);
      return current > new Date(checkInDate) && current < new Date(checkOutDate);
    }
    return false;
  };

  // Month navigation increments handlers
  const adjustMonthViewport = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const adjusted = new Date(prev.getFullYear(), prev.getMonth() + (direction === "next" ? 1 : -1), 1);
      return adjusted;
    });
  };

  // Total calculated sequence metrics parameters
  const calculatedNights = useMemo<number>(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const diffTime = Math.abs(new Date(checkOutDate).getTime() - new Date(checkInDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [checkInDate, checkOutDate]);

  // Dispatch redirection parameters directly down to search funnel templates
  const forwardToBookingSearch = () => {
    if (!checkInDate || !checkOutDate) return;
    router.push(
      `/hotel-landing-page/rooms?roomIds=&checkin=${checkInDate}&checkout=${checkOutDate}&guests=${guestCount}`
    );
  };

  const monthLabel = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-10">
      
      {/* Title Segment */}
      <div className="mb-10">
        <span className="text-xs uppercase tracking-widest font-semibold text-zinc-400 block mb-2">Live Resort Inventory</span>
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900">Availability Calendar</h1>
        <p className="text-sm font-light text-zinc-500 mt-2 max-w-xl">
          Review our real-time operational capacity by category nights. Select your arrival and departure markers below to build an open stay timeline.
        </p>
      </div>

      {/* Pill Filters Selector Layout Row */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-zinc-100 pb-6">
        {(["all", "deluxe", "suite", "villa", "overwater"] as RoomType[]).map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setCheckInDate(null);
              setCheckOutDate(null);
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer capitalize ${
              activeCategory === category 
                ? "bg-zinc-950 text-white shadow-sm" 
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/40"
            }`}
          >
            {category === "all" ? "All Accommodations" : `${category} categories`}
          </button>
        ))}
      </div>

      {/* Main Split Multi-Column Grid Panel block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Aspect Side Column Frame - Custom Grid Calendar Controller */}
        <div className="lg:col-span-8 bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
          
          {/* Calendar Pagination Banner Wrapper */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-medium text-zinc-900 tracking-tight">{monthLabel}</h2>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => adjustMonthViewport("prev")}
                className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => adjustMonthViewport("next")}
                className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Structural Headers Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day} className="text-[11px] font-medium text-zinc-400 py-2 uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Dynamic Days Array Custom Loop Mesh Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarGridCells.map((cell, index) => {
              if (!cell.dateStr || !cell.dayNumber) {
                return <div key={`empty-${index}`} className="aspect-square bg-zinc-50/40 rounded-xl" />;
              }

              const { isFullySoldOut, lowInventoryAlert, availableRoomsCount } = getDateStatus(cell.dateStr);
              const isHighlighted = verifyDayIsHighlighted(cell.dateStr);
              const isStartNode = cell.dateStr === checkInDate;
              const isEndNode = cell.dateStr === checkOutDate;

              return (
                <button
                  key={cell.dateStr}
                  disabled={isFullySoldOut}
                  onClick={() => handleCellSelection(cell.dateStr!, isFullySoldOut)}
                  className={`aspect-square rounded-xl p-2 flex flex-col justify-between items-start border relative transition-all group ${
                    isFullySoldOut 
                      ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed line-through" 
                      : isStartNode || isEndNode
                      ? "bg-zinc-950 border-zinc-950 text-white shadow-sm cursor-pointer z-10"
                      : isHighlighted
                      ? "bg-zinc-100/80 border-zinc-200/60 text-zinc-900 cursor-pointer"
                      : "bg-white border-zinc-100 hover:border-zinc-300 text-zinc-800 cursor-pointer"
                  }`}
                >
                  {/* Day Numeric Code Tag */}
                  <span className={`text-xs font-medium ${isStartNode || isEndNode ? "text-white" : "text-zinc-900"}`}>
                    {cell.dayNumber}
                  </span>

                  {/* Room Inventory Fractional Availability Sub-labels */}
                  {!isFullySoldOut && (
                    <div className="w-full flex items-center justify-between text-[9px] mt-auto font-light tracking-tight">
                      <span className={
                        isStartNode || isEndNode 
                          ? "text-zinc-300" 
                          : lowInventoryAlert 
                          ? "text-amber-600 font-normal" 
                          : "text-zinc-400"
                      }>
                        {lowInventoryAlert ? "Low" : `${availableRoomsCount} Left`}
                      </span>
                      
                      {/* Operational Color Dot Status Signifiers */}
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isStartNode || isEndNode
                          ? "bg-white"
                          : lowInventoryAlert
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Color Map Legend Footer Guide */}
          <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-wrap gap-4 items-center text-[11px] text-zinc-400 font-light">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Standard Operational Availability</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Low Capacity Overnights</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-zinc-200 rounded-sm line-through block size-2.5" />
              <span>Fully Allocated / Sold Out Night</span>
            </div>
          </div>

        </div>

        {/* Right Side Column Frame - Selection Parameter Summarizer Container */}
        <div className="lg:col-span-4 bg-white border border-zinc-200/60 shadow-sm rounded-2xl p-6 space-y-6 lg:sticky lg:top-28">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 bg-zinc-100 text-zinc-600 rounded-md inline-block mb-2">
              Timeline Summary
            </span>
            <h3 className="text-lg font-medium text-zinc-900 tracking-tight">Your Selected Window</h3>
          </div>

          {/* Date Selector Display Interfaces */}
          <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-200 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-zinc-200">
              <div className="p-3.5 bg-zinc-50/50">
                <label className="block text-[9px] uppercase font-bold text-zinc-400 mb-1 flex items-center gap-1">
                  <CalendarIcon size={10} /> Check-In
                </label>
                <div className="text-zinc-800 text-xs font-medium min-h-[16px]">
                  {checkInDate ? new Date(checkInDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span className="text-zinc-300 font-light">Choose Date</span>}
                </div>
              </div>
              <div className="p-3.5 bg-zinc-50/50">
                <label className="block text-[9px] uppercase font-bold text-zinc-400 mb-1 flex items-center gap-1">
                  <CalendarIcon size={10} /> Check-Out
                </label>
                <div className="text-zinc-800 text-xs font-medium min-h-[16px]">
                  {checkOutDate ? new Date(checkOutDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span className="text-zinc-300 font-light">Choose Date</span>}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50/50 flex flex-col gap-1.5">
              <label className="block text-[9px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                <Users size={10} /> Occupant Multipliers
              </label>
              <select 
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="bg-transparent text-zinc-700 text-xs font-normal focus:outline-none w-full cursor-pointer"
              >
                <option value={1}>1 Adult Guest</option>
                <option value={2}>2 Adults registered</option>
                <option value={3}>3 Adults registered</option>
                <option value={4}>4 Adults registered</option>
              </select>
            </div>
          </div>

          {/* Core Selection Context Prompt Block */}
          {checkInDate && checkOutDate ? (
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
              <div className="text-left">
                <span className="text-xs text-zinc-400 font-light block">Stay Length</span>
                <span className="text-base font-semibold text-zinc-950">{calculatedNights} Nights Duration</span>
              </div>
              <span className="p-1.5 bg-zinc-900 text-white rounded-lg">
                <Check size={14} />
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-xl flex items-start gap-2.5 text-xs font-light">
              <Info size={15} className="text-zinc-400 shrink-0 mt-0.5" />
              <span>Please click an open start date and end date node map directly on the layout grid to calculate space matching inventory.</span>
            </div>
          )}

          {/* Action Submission Buttons Funnel Redirect */}
          <button
            disabled={!checkInDate || !checkOutDate}
            onClick={forwardToBookingSearch}
            className={`w-full py-3.5 rounded-xl text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 uppercase tracking-wide ${
              checkInDate && checkOutDate
                ? "bg-zinc-950 hover:bg-black text-white cursor-pointer"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            }`}
          >
            <span>Search Available Rooms</span>
            <ArrowRight size={14} />
          </button>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-center gap-2 text-[10px] text-zinc-400 font-light">
            <ShieldCheck size={14} className="text-zinc-500" />
            <span>Live Syncing Directus Database Cache Nodes</span>
          </div>
        </div>

      </div>
    </div>
  );
}