"use server";

import { directus } from "../lib/directus";
import { createItem, createItems, readItems } from "@directus/sdk";

async function getOrCreateGuest(data: any) {
  const existingGuests = await directus.request(
    readItems("guests_hos", { filter: { email: { _eq: data.email } } })
  );
  if (existingGuests?.length > 0) return existingGuests[0].id;
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