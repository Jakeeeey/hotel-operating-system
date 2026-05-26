import React from "react";

interface Props {
  dateStr: string;
  dayNumber: number;
  isPast: boolean;
  isFullySoldOut: boolean;
  lowInventoryAlert: boolean;
  availableRoomsCount: number;
  isEndpoint: boolean;
  inRange: boolean;
  onClick: (dateStr: string, isUnavailable: boolean) => void;
  onHover: (dateStr: string | null) => void;
}

export const CalendarCell = ({
  dateStr,
  dayNumber,
  isPast,
  isFullySoldOut,
  lowInventoryAlert,
  availableRoomsCount,
  isEndpoint,
  inRange,
  onClick,
  onHover,
}: Props) => (
  <div className={`relative bg-white ${inRange && !isEndpoint ? "bg-zinc-50" : ""}`}>
    <button
      disabled={isFullySoldOut || isPast}
      onClick={() => onClick(dateStr, isFullySoldOut || isPast)}
      onMouseEnter={() => onHover(dateStr)}
      onMouseLeave={() => onHover(null)}
      className={`relative w-full min-h-[56px] rounded-none flex flex-col items-start justify-between p-2 text-[11px] font-bold transition-all border border-transparent ${
        isPast || isFullySoldOut ? "text-zinc-300 cursor-not-allowed bg-zinc-50/40" : "text-zinc-800"
      } ${
        isEndpoint
          ? "bg-zinc-950 text-white! border-zinc-950 z-10 shadow-xs"
          : inRange
            ? "bg-zinc-100/80 text-zinc-900 border-zinc-200/40"
            : "hover:bg-zinc-50 hover:border-zinc-300"
      }`}
    >
      <span className="leading-none tracking-wide">{dayNumber}</span>
      
      {!isFullySoldOut && !isPast && !isEndpoint && (
        <span className={`text-[9px] font-medium tracking-tight mt-auto ${lowInventoryAlert ? "text-amber-600" : "text-zinc-400"}`}>
          {lowInventoryAlert ? "Low" : `${availableRoomsCount} Left`}
        </span>
      )}

      {isFullySoldOut && !isPast && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <span className="w-full h-[1px] bg-zinc-300 rotate-45 absolute" />
        </span>
      )}
    </button>
  </div>
);