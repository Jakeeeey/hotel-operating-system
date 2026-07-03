"use server";

import { readItems } from "@directus/sdk";
import { directus } from "../../booking/lib/directus";
import { getLockedReservationIds } from "../../booking/services/booking.service";

/**
 * Dynamically fetches valid inventory capacity and bookings matching the month and guest configuration
 */
export async function getMonthlyInventory(year: number, month: number, adults: number = 2, children: number = 0) {
  try {
    // 1. Calculate the start and end string metrics for the requested month window
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 1).toISOString().split("T")[0];

    // 2. Fetch all physical rooms whose parent room type can accommodate the guest count
    const eligibleRooms = await directus.request(
      readItems("rooms_hos", {
        filter: {
          type_id: {
            max_adults: { _gte: adults },
            max_children: { _gte: children }
          }
        },
        fields: ["id"]
      })
    );

    const eligibleRoomIds = (eligibleRooms as Array<{ id: number }>).map((room) => room.id);

    // If no room layouts can handle this party size configuration, return zero available inventory
    if (eligibleRoomIds.length === 0) {
      return {
        capacity: 0,
        bookings: []
      };
    }

    const lockedReservationIds = await getLockedReservationIds();

    // 3. Fetch existing reservation items for these eligible rooms within the month range
    const activeBookings = await directus.request(
      readItems("reservation_items_hos", {
        filter: {
          _and: [
            { night_date: { _gte: startDate } },
            { night_date: { _lt: endDate } },
            { room_id: { _in: eligibleRoomIds } },
            { reservation_id: { _in: lockedReservationIds.length > 0 ? lockedReservationIds : [-1] } }
          ]
        },
        fields: ["night_date", "room_id"]
      })
    );

    return {
      // Dynamic capacity is the precise count of physical rooms that can fit the guests
      capacity: eligibleRoomIds.length,
      bookings: activeBookings || []
    };
  } catch (error) {
    console.error("Database inventory lookup execution failure:", error);
    return {
      capacity: 0,
      bookings: []
    };
  }
}