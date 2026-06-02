
// 1. Core Domain & API Data Contract Models

export type RoomType = "all" | "deluxe" | "suite" | "villa" | "overwater";

/**
 * Matches a single room-night reservation entry from your Directus DB.
 * Maps 1:1 with the `reservation_items_hos` table layout.
 */
export interface ReservationItem {
  id: number;
  reservationId: number;
  roomId: number;
  nightDate: string;
  adultsCount: number;
  childrenCount: number;
}

/**
 * Represents a raw inventory row from the database for a specific category night.
 */
export interface InventoryNight {
  date: string;
  roomType: RoomType; 
  totalInventory: number;
  allocatedCount: number;
  remainingAvailable: number;
}

/**
 * Nested map structure representing raw raw JSON payloads streamed directly 
 * from the room inventory database endpoints.
 */
export interface InventoryMap {
  [date: string]: {
    [typeId: string]: {
      remainingAvailable: number;
      bookedCount?: number;
      totalInventory?: number;
    };
  };
}



// 2. Flattened Availability Calendar Types (Simplified UI Processing Matrix)

/**
 * High-performance flat block representing overall daily metrics 
 * decoupled from individual room category filters.
 */
export interface FlatDayInventory {
  date: string;
  totalInventory: number;
  allocatedCount: number;
  remainingAvailable: number;
}

/**
 * Flat date lookup mapping matrix enabling direct O(1) rendering checks 
 * without running nested loops inside grid layout loops.
 */
export interface FlatInventoryLookup {
  [dateStr: string]: FlatDayInventory;
}



// 3. UI Component Display, State Props & Cache Layouts


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