export type RoomType = "all" | "deluxe" | "suite" | "villa" | "overwater";

export interface InventoryNight {
  date: string;               // ISO format string: YYYY-MM-DD
  roomType: Exclude<RoomType, "all">;
  totalInventory: number;     // Physical count built at resort
  allocatedCount: number;     // Rooms currently booked overnight
  remainingAvailable: number; // calculated: totalInventory - allocatedCount
}

export interface DayStatusCache {
  isFullySoldOut: boolean;
  lowInventoryAlert: boolean;
  availableRoomsCount: number;
}

// O(1) Key-Value Map format matching Next.js memoized lookups
export type InventoryLookupMap = Record<string, Record<string, InventoryNight>>;