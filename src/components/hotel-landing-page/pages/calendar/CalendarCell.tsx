// CalendarCell.tsx
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
  <div
    className={`relative flex items-center justify-center ${inRange ? "bg-zinc-100" : ""}`}
  >
    <button
      disabled={isFullySoldOut || isPast}
      onClick={() => onClick(dateStr, isFullySoldOut || isPast)}
      onMouseEnter={() => onHover(dateStr)}
      onMouseLeave={() => onHover(null)}
      className={`relative w-full min-h-[52px] rounded-lg flex flex-col items-start justify-between p-1.5 text-xs font-medium transition-all ${
        isPast || isFullySoldOut ? "text-zinc-300 cursor-not-allowed" : ""
      } ${isEndpoint ? "bg-zinc-900 text-white" : inRange ? "text-zinc-800" : "hover:bg-zinc-100"}`}
    >
      <span className="leading-none">{dayNumber}</span>
      {!isFullySoldOut && !isPast && !isEndpoint && (
        <span
          className={lowInventoryAlert ? "text-amber-500" : "text-emerald-500"}
        >
          {lowInventoryAlert ? "Low" : `${availableRoomsCount} left`}
        </span>
      )}
      {isFullySoldOut && !isPast && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-[100%] h-px bg-zinc-300 rotate-45 absolute" />

          {isEndpoint && <span className="absolute inset-0 bg-zinc-900" />}
        </span>
      )}
    </button>
  </div>
);
