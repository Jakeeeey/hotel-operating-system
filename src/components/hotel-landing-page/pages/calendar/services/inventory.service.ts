"use server";

import { readItems } from "@directus/sdk";
import { directus } from "../../booking/lib/directus";

/**
 * Fetches all booked reservation item rows for a given month.
 * Returns a raw array of { night_date } objects for CalendarLayout to process.
 */
export async function getMonthlyInventory(year: number, month: number) {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  console.log(`[inventory] Querying ${startDate} to ${endDate}`);

  try {
    const bookedItems = await directus.request(
      readItems("reservation_items_hos", {
        filter: { night_date: { _between: [startDate, endDate] } },
        fields: ['night_date'],
        limit: -1
      })
    );

    console.log(`[inventory] Got ${bookedItems.length} booked items`, bookedItems.slice(0, 3));

    return bookedItems;

  } catch (error) {
    console.error("[inventory] Directus query failed:", error);
    return [];
  }
}