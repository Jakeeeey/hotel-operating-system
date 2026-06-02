"use server";

import { directus } from "../lib/directus";
import { createItem, createItems, readItems } from "@directus/sdk";

export async function createBookingTransaction(data: any, details: any) {
  try {
    // 1. Get or Create Guest
    const existingGuests = await directus.request(
      readItems("guests_hos", {
        filter: { email: { _eq: data.email } },
      }),
    );

    let guestId;
    if (existingGuests && existingGuests.length > 0) {
      guestId = existingGuests[0].id;
    } else {
      const guest = await directus.request(
        createItem("guests_hos", {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          contact_number: data.phone,
        }),
      );
      guestId = guest.id;
    }

    // 2. Create Reservation Header
    const reservation = await directus.request(
      createItem("reservations_hos", {
        guest_id: guestId,
        check_in: details.checkin,
        check_out: details.checkout,
        total_amount: details.total,
        status: "pending",
      }),
    );

    // 3. Helper to generate array of dates
    const start = new Date(details.checkin);
    const end = new Date(details.checkout);
    const dates = [];
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }

    // 4. Create Reservation Items using createItems (Bulk)
    const availableRooms = await directus.request(
      readItems("rooms_hos", {
        filter: { type_id: { _eq: details.roomTypeId } },
        limit: 1, // Get the first available room of this type
      }),
    );

    if (!availableRooms || availableRooms.length === 0) {
      throw new Error("No rooms available for this type.");
    }

    const roomIdToBook = availableRooms[0].id; // Use the actual ID found in your DB

    const itemsToCreate = dates.map((date) => ({
      reservation_id: reservation.id,
      room_id: roomIdToBook,
      night_date: date,
    }));

    // Use createItems for bulk insert
    if (itemsToCreate.length > 0) {
      await directus.request(
        createItems("reservation_items_hos", itemsToCreate),
      );
      console.log("Successfully created items:", itemsToCreate.length);
    }

    return { success: true, id: reservation.id };
  } catch (error: any) {
    // This logs the full error object to your terminal for debugging
    console.error(
      "Booking Transaction Failed:",
      JSON.stringify(error, null, 2),
    );

    const directusMessage =
      error?.errors?.[0]?.message || error?.message || "Unknown Database Error";

    return {
      success: false,
      error: directusMessage,
    };
  }
}
