import { readItems } from "@directus/sdk";
import { directus } from "../../booking/lib/directus";
import { InventoryMap } from "../types/types";


/**
 * Transforms raw database bookings into an inventory map for the UI.
 */
function transformToInventoryMap(bookedItems: any[], roomTypes: any[]): InventoryMap {
  const map: InventoryMap = {};

  // Define your total capacity (ideally this could come from your room_types_hos table)
  const TOTAL_CAPACITY: Record<string, number> = {
    "deluxe": 5,
    "suite": 3,
    "villa": 2,
    "overwater": 2
  };

  // Initialize your map (add logic here if you need to pre-fill dates)
  bookedItems.forEach((item) => {
    const date = item.night_date;
    const typeId = item.room_id.type_id; // Ensure this matches your room type keys

    if (!map[date]) {
      map[date] = {};
    }
    if (!map[date][typeId]) {
      map[date][typeId] = { remainingAvailable: TOTAL_CAPACITY[typeId] || 0 };
    }

    // Subtract booking from capacity
    map[date][typeId].remainingAvailable -= 1;
  });

  return map;
}
/**
 * Fetches total rooms and booked rooms to calculate remaining inventory.
 */
export async function getMonthlyInventory(year: number, month: number) {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

  // 1. Get capacity per room type (total number of rooms available)
  const roomTypes = await directus.request(readItems("room_types_hos", { fields: ['id'] }));
  
  // 2. Get all reservations for the month
  const bookedItems = await directus.request(
    readItems("reservation_items_hos", {
      filter: { night_date: { _between: [startDate, endDate] } },
      fields: ['night_date', 'room_id.type_id']
    })
  );

  // 3. Aggregate: Logic to subtract booked rooms from total capacity
  // This will return an object: { [date]: { [typeId]: remainingCount } }
  return transformToInventoryMap(bookedItems, roomTypes);
}