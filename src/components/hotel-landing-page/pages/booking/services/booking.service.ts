"use server";

import { directus } from "../lib/directus";
import { createItem, createItems, readItems, updateItem } from "@directus/sdk";
import { initiatePaymentSession } from "./payment/paymongo.service";
import { BookingFormValues } from "../schema/booking.schema";

// --- STRICT INTERFACES FOR DOMAIN TYPE SAFETY ---

interface BookingTransactionPayload {
  roomIds: number[];
  roomTypeId: number;
  roomDetails: Array<{ id: number; name: string; price: number }>;
  totalNights: number;
  checkin: string;
  checkout: string;
  total: number;
  adults: number;
  children: number;
}

interface DirectusRoom {
  id: number;
  type_id: number;
}

interface DirectusReservationItem {
  id?: number;
  reservation_id: string | number;
  room_id: number;
  night_date: string;
  adults_count: number;
  children_count: number;
}

interface DirectusGuest {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
}

interface DirectusReservationHeader {
  id: string | number;
  guest_id: string | number;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: "pending" | "paid" | "cancelled";
}

interface InventoryBookingRecord {
  night_date: string;
  room_id: number;
}

/**
 * Dynamically fetches valid inventory capacity and bookings matching the month and guest configuration
 */
export async function getMonthlyInventory(
  year: number, 
  month: number, 
  adults: number = 2, 
  children: number = 0
): Promise<{ capacity: number; bookings: InventoryBookingRecord[] }> {
  try {
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 1).toISOString().split("T")[0];

    const eligibleRooms = await directus.request<DirectusRoom[]>(
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

    const eligibleRoomIds = eligibleRooms.map((room) => room.id);

    if (eligibleRoomIds.length === 0) {
      return { capacity: 0, bookings: [] };
    }

    const d = new Date(Date.now() - 15 * 60 * 1000);
    const manilaDate = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    const fifteenMinsAgo = manilaDate.toISOString().replace('Z', '');

    const activeBookings = await directus.request<InventoryBookingRecord[]>(
      readItems("reservation_items_hos", {
        filter: {
          _and: [
            { night_date: { _gte: startDate } },
            { night_date: { _lt: endDate } },
            { room_id: { _in: eligibleRoomIds } },
            {
              _or: [
                { reservation_id: { status: { _eq: "paid" } } },
                { reservation_id: { status: { _eq: "confirmed" } } },
                {
                  _and: [
                    { reservation_id: { status: { _eq: "pending" } } },
                    { reservation_id: { created_at: { _gte: fifteenMinsAgo } } }
                  ]
                }
              ]
            }
          ]
        },
        fields: ["night_date", "room_id"]
      })
    );

    return {
      capacity: eligibleRoomIds.length,
      bookings: activeBookings || []
    };
  } catch (error) {
    console.error("Database inventory lookup execution failure:", error);
    return { capacity: 0, bookings: [] };
  }
}

/**
 * Resolves or creates global guest identity data matrices securely
 */
async function getOrCreateGuest(data: BookingFormValues): Promise<string | number> {
  const existingGuests = await directus.request<DirectusGuest[]>(
    readItems("guests_hos", { filter: { email: { _eq: data.email } } })
  );
  
  if (existingGuests && existingGuests.length > 0) {
    const existingId = existingGuests[0].id;
    await directus.request(
      updateItem("guests_hos", existingId, {
        first_name: data.firstName,
        last_name: data.lastName,
        contact_number: data.phone,
      })
    );
    return existingId;
  }
  
  const newGuest = await directus.request<DirectusGuest>(
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
 * Finds IDs of rooms that are NOT booked during the selected range.
 */
async function getAvailableRoomIds(typeId: number, checkin: string, checkout: string): Promise<number[]> {
  const allRooms = await directus.request<DirectusRoom[]>(
    readItems("rooms_hos", { filter: { type_id: { _eq: typeId } } })
  );

  const d = new Date(Date.now() - 15 * 60 * 1000);
  const manilaDate = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  const fifteenMinsAgo = manilaDate.toISOString().replace('Z', '');

  const bookedItems = await directus.request<Array<{ room_id: number }>>(
    readItems("reservation_items_hos", {
      filter: {
        _and: [
          { night_date: { _gte: checkin } },
          { night_date: { _lt: checkout } },
          {
            _or: [
              { reservation_id: { status: { _eq: "paid" } } },
              { reservation_id: { status: { _eq: "confirmed" } } },
              {
                _and: [
                  { reservation_id: { status: { _eq: "pending" } } },
                  { reservation_id: { created_at: { _gte: fifteenMinsAgo } } }
                ]
              }
            ]
          }
        ]
      },
      fields: ['room_id']
    })
  );

  const bookedRoomIds = new Set<number>(bookedItems.map((item) => item.room_id));

  const availableIds = allRooms
    .filter((room) => !bookedRoomIds.has(room.id))
    .map((room) => room.id);

  console.log("--- DEBUG getAvailableRoomIds ---");
  console.log("fifteenMinsAgo (Manila):", fifteenMinsAgo);
  console.log("bookedItems blocking:", JSON.stringify(bookedItems));
  console.log("allRooms for type:", JSON.stringify(allRooms));
  console.log("availableIds:", availableIds);
  console.log("---------------------------------");

  return availableIds;
}

/**
 * Orchestrates localized database record initialization and links to PayMongo checkout generation hooks.
 */
export async function createBookingTransaction(
  data: BookingFormValues, 
  details: BookingTransactionPayload
): Promise<{ success: boolean; id?: string | number; checkoutUrl?: string; error?: string }> {
  try {
    const guestId = await getOrCreateGuest(data);

    // 1. Build linear date sequence ranges
    const start = new Date(details.checkin);
    const end = new Date(details.checkout);
    const dates: string[] = [];
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }

    // 2. Map requested room types to available physical rooms
    const typeAllocations: Record<number, number> = {};
    for (const roomTypeId of details.roomIds) {
      typeAllocations[roomTypeId] = (typeAllocations[roomTypeId] || 0) + 1;
    }

    const physicalRoomAllocations: Array<{ roomTypeId: number; physicalRoomId: number }> = [];

    for (const [roomTypeIdStr, countRequested] of Object.entries(typeAllocations)) {
      const roomTypeId = Number(roomTypeIdStr);
      const availablePhysicalIds = await getAvailableRoomIds(roomTypeId, details.checkin, details.checkout);

      if (availablePhysicalIds.length < countRequested) {
        const roomTypeName = details.roomDetails.find(r => r.id === roomTypeId)?.name || `Type ${roomTypeId}`;
        throw new Error(`Rooms for ${roomTypeName} are no longer available for these dates.`);
      }

      const allocatedForType = availablePhysicalIds.slice(0, countRequested);
      for (const physicalRoomId of allocatedForType) {
        physicalRoomAllocations.push({ roomTypeId, physicalRoomId });
      }
    }

    // 3. Coerce pricing securely to verify numbers before database writing or API calls
    const trueNumericTotal = Number(details.total);
    if (isNaN(trueNumericTotal) || trueNumericTotal <= 0) {
      throw new Error(`Invalid total calculation parameter passed to server pipeline: (${details.total})`);
    }

    // 4. Insert the tracking metadata header as "pending"
    const reservation = await directus.request<DirectusReservationHeader>(
      createItem("reservations_hos", {
        guest_id: guestId,
        check_in: details.checkin,
        check_out: details.checkout,
        total_amount: trueNumericTotal,
        status: "pending",
      })
    );

    // 5. Draft physical unit items to populate relational schema bindings
    const itemsToCreate: DirectusReservationItem[] = [];
    for (const alloc of physicalRoomAllocations) {
      for (const date of dates) {
        itemsToCreate.push({
          reservation_id: reservation.id,
          room_id: alloc.physicalRoomId,
          night_date: date,
          adults_count: Number(details.adults ?? 2),
          children_count: Number(details.children ?? 0),
        });
      }
    }

    await directus.request(createItems("reservation_items_hos", itemsToCreate));

    // 6. --- CONNECT TO THE PAYMONGO SESSION GATEWAY ---
    const roomNamesDisplay: string = details.roomDetails.map((r) => r.name).join(", ");
    
    // Server console logging to confirm structural integrity during debugging
    console.log("DEBUG: Handing execution over to PayMongo service wrapper with properties:", {
      totalAmountSent: trueNumericTotal,
      computedRoomDisplayString: roomNamesDisplay,
      assignedReservationID: reservation.id
    });

    const paymentSession = await initiatePaymentSession({
      amount: trueNumericTotal,
      guestName: `${data.firstName} ${data.lastName}`,
      guestEmail: data.email,
      guestPhone: data.phone,
      roomName: roomNamesDisplay,
      reservationId: reservation.id.toString(),
    });

    if (!paymentSession.success || !paymentSession.checkoutUrl) {
      throw new Error(paymentSession.error || "The processing financial gateway rejected token authorization initialization.");
    }

    // Hand back the complete successful confirmation sequence data array directly to the view layout
    return { 
      success: true, 
      id: reservation.id, 
      checkoutUrl: paymentSession.checkoutUrl 
    };

  } catch (error: unknown) {
    console.error("Booking Transaction Failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected backend error stalled initialization protocols.",
    };
  }
}

/**
 * Dynamically determines the actual availability of room types for a specified date range
 */
export async function getRoomTypesAvailability(
  checkin: string,
  checkout: string
): Promise<Record<number, { available: boolean; remaining: number }>> {
  try {
    console.log("--- DEBUG getRoomTypesAvailability ---");
    console.log("checkin:", checkin, "checkout:", checkout);
    if (!checkin || !checkout) {
      console.log("Missing checkin or checkout");
      return {};
    }

    const allRooms = await directus.request<DirectusRoom[]>(
      readItems("rooms_hos", { fields: ["id", "type_id"] })
    );
    console.log("allRooms:", JSON.stringify(allRooms));

    const d = new Date(Date.now() - 15 * 60 * 1000);
    const manilaDate = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    const fifteenMinsAgo = manilaDate.toISOString().replace('Z', '');

    const bookedItems = await directus.request<Array<{ room_id: number }>>(
      readItems("reservation_items_hos", {
        filter: {
          _and: [
            { night_date: { _gte: checkin } },
            { night_date: { _lt: checkout } },
            {
              _or: [
                { reservation_id: { status: { _eq: "paid" } } },
                { reservation_id: { status: { _eq: "confirmed" } } },
                {
                  _and: [
                    { reservation_id: { status: { _eq: "pending" } } },
                    { reservation_id: { created_at: { _gte: fifteenMinsAgo } } }
                  ]
                }
              ]
            }
          ]
        },
        fields: ['room_id']
      })
    );
    console.log("bookedItems:", JSON.stringify(bookedItems));

    const bookedRoomIds = new Set<number>(bookedItems.map((item) => item.room_id));

    const roomsByType: Record<number, number[]> = {};
    for (const room of allRooms) {
      if (!roomsByType[room.type_id]) {
        roomsByType[room.type_id] = [];
      }
      roomsByType[room.type_id].push(room.id);
    }

    const availabilityMap: Record<number, { available: boolean; remaining: number }> = {};
    for (const [typeIdStr, roomIds] of Object.entries(roomsByType)) {
      const typeId = Number(typeIdStr);
      const availableRooms = roomIds.filter(id => !bookedRoomIds.has(id));
      availabilityMap[typeId] = {
        available: availableRooms.length > 0,
        remaining: availableRooms.length
      };
    }

    console.log("availabilityMap:", JSON.stringify(availabilityMap));
    console.log("--------------------------------------");
    return availabilityMap;
  } catch (error) {
    console.error("Failed to check room types availability:", error);
    return {};
  }
}