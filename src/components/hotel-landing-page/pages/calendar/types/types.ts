export type RoomType = "all" | "deluxe" | "suite" | "villa" | "overwater";

export interface InventoryNight {
  date: string;
  roomType: Exclude<RoomType, "all">;
  totalInventory: number;
  allocatedCount: number;
  remainingAvailable: number;
}

export interface InventoryLookupMap {
  [dateStr: string]: { [key in Exclude<RoomType, "all">]?: InventoryNight };
}

export interface InventoryMap {
  [date: string]: {
    [typeId: string]: { remainingAvailable: number };
  };
}

export interface DayStatusCache {
  isFullySoldOut: boolean;
  lowInventoryAlert: boolean;
  availableRoomsCount: number;
}

export interface CalendarStateProps {
  checkInDate: string | null;
  checkOutDate: string | null;
  hoverDate: string | null;
}

export interface CalendarCell {
  dateStr: string | null;
  dayNumber: number | null;
}