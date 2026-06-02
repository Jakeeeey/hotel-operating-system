"use server";

import { readItems } from "@directus/sdk";
import { directus } from "../../booking/lib/directus";

/**
 * Fetches dynamic room capacity and all booked reservation item rows for a given month.
 * Returns { capacity: number, bookings: Array<{ night_date: string }> }
 */
export async function getMonthlyInventory(year: number, month: number) {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  console.log(`[inventory] Querying ${startDate} to ${endDate}`);

  try {
    // Run both queries in parallel for performance
    const [rooms, bookedItems] = await Promise.all([
      directus.request(
        readItems("rooms_hos", {
          fields: ['id'],
          limit: -1
        })
      ),
      directus.request(
        readItems("reservation_items_hos", {
          filter: { night_date: { _between: [startDate, endDate] } },
          fields: ['night_date'],
          limit: -1
        })
      )
    ]);

    const dynamicCapacity = rooms.length > 0 ? rooms.length : 20; // Fallback to 20 if table is empty

    console.log(`[inventory] Got capacity: ${dynamicCapacity}, booked items: ${bookedItems.length}`);

    return {
      capacity: dynamicCapacity,
      bookings: bookedItems
    };

  } catch (error) {
    console.error("[inventory] Directus query failed:", error);
    return {
      capacity: 20,
      bookings: []
    };
  }
}