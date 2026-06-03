"use server";

import { directus } from "../lib/directus";
import { createItem, createItems, readItems, updateItem } from "@directus/sdk";

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

    const eligibleRoomIds = eligibleRooms.map((room: any) => room.id);

    // If no room layouts can handle this party size configuration, return zero available inventory
    if (eligibleRoomIds.length === 0) {
      return {
        capacity: 0,
        bookings: []
      };
    }

    // 3. Fetch existing reservation items for these eligible rooms within the month range
    const activeBookings = await directus.request(
      readItems("reservation_items_hos", {
        filter: {
          _and: [
            { night_date: { _gte: startDate } },
            { night_date: { _lt: endDate } },
            { room_id: { _in: eligibleRoomIds } }
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

async function getOrCreateGuest(data: any) {
  const existingGuests = await directus.request(
    readItems("guests_hos", { filter: { email: { _eq: data.email } } })
  );
  
  if (existingGuests?.length > 0) {
    const existingId = existingGuests[0].id;
    // Sync their latest information just in case it changed (e.g., they married, changed phone number)
    await directus.request(
      updateItem("guests_hos", existingId, {
        first_name: data.firstName,
        last_name: data.lastName,
        contact_number: data.phone,
      })
    );
    return existingId;
  }
  
  const newGuest = await directus.request(
    createItem("guests_hos", {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      contact_number: data.phone,
    })
  );
  return newGuest.id;
}

/**
 * NEW: Finds IDs of rooms that are NOT booked during the selected range.
 */
async function getAvailableRoomIds(typeId: number, checkin: string, checkout: string) {
  // 1. Get all rooms of this type
  const allRooms = await directus.request(
    readItems("rooms_hos", { filter: { type_id: { _eq: typeId } } })
  );

  // 2. Find rooms that are booked during this range
  const bookedItems = await directus.request(
    readItems("reservation_items_hos", {
      filter: {
        _and: [
          { night_date: { _gte: checkin } },
          { night_date: { _lt: checkout } }
        ]
      },
      fields: ['room_id']
    })
  );

  const bookedRoomIds = new Set(bookedItems.map((item: any) => item.room_id));

  // 3. Return only rooms NOT in the booked list
  return allRooms
    .filter((room: any) => !bookedRoomIds.has(room.id))
    .map((room: any) => room.id);
}

export async function createBookingTransaction(data: any, details: any) {
  try {
    const guestId = await getOrCreateGuest(data);

    // 1. Availability Check
    const availableIds = await getAvailableRoomIds(details.roomTypeId, details.checkin, details.checkout);
    
    if (availableIds.length < details.roomIds.length) {
      throw new Error("Some selected rooms are no longer available for these dates.");
    }

    // 2. Create Reservation Header
    const reservation = await directus.request(
      createItem("reservations_hos", {
        guest_id: guestId,
        check_in: details.checkin,
        check_out: details.checkout,
        total_amount: details.total,
        status: "pending",
      })
    );

    // 3. Prepare dates
    const start = new Date(details.checkin);
    const end = new Date(details.checkout);
    const dates = [];
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }

    // 4. Create Reservation Items
    const itemsToCreate = [];
    for (const roomId of details.roomIds) {
      for (const date of dates) {
        itemsToCreate.push({
          reservation_id: reservation.id,
          room_id: roomId,
          night_date: date,
          adults_count: Number(details.adults ?? 2),
          children_count: Number(details.children ?? 0),
        });
      }
    }

    await directus.request(createItems("reservation_items_hos", itemsToCreate));

    return { success: true, id: reservation.id };
  } catch (error: any) {
    console.error("Booking Transaction Failed:", error);
    return {
      success: false,
      error: error?.errors?.[0]?.message || error?.message || "Booking failed",
    };
  }
}