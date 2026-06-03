"use server";

import { directus } from "../../lib/directus";
import { updateItem, readItem } from "@directus/sdk";

interface VerificationResult {
  success: boolean;
  guestName?: string;
  email?: string;
  totalAmount?: number;
  checkInDate?: string;  // Added type definition
  checkOutDate?: string; // Added type definition
  error?: string;
}

/**
 * Reconciles the redirect payload, transitions status to paid, and resolves guest metadata.
 */
export async function verifyAndFinalizeReservation(reservationId: string): Promise<VerificationResult> {
  try {
    if (!reservationId) {
      return { success: false, error: "Missing reservation reference ID configuration parameter." };
    }

    let reservation: any;
    
    // STAGE 1: Attempt to read the item along with its guest relationships
    try {
      reservation = await directus.request<any>(
        readItem("reservations_hos", reservationId, {
          fields: ["*", "guest_id.*"],
        })
      );
    } catch (readError: any) {
      console.error("❌ [STAGE 1 FAILED] Directus Read Operation Error:", readError);
      return {
        success: false,
        error: `[Directus Fetch Error]: ${readError.message || "Failed to read the reservation row."}`,
      };
    }

    if (!reservation) {
      return { success: false, error: `Reservation reference allocation #${reservationId} could not be located.` };
    }

    // STAGE 2: Attempt to transition the state flag cleanly to "paid"
    try {
      await directus.request(
        updateItem("reservations_hos", reservationId, {
          status: "paid",
        })
      );
    } catch (updateError: any) {
      console.error("❌ [STAGE 2 FAILED] Directus Update Operation Error:", updateError);
      return {
        success: false,
        error: `[Directus Update Error]: ${updateError.message || "Failed to change status to 'paid'."}`,
      };
    }

    // STAGE 3: Resolve formatting boundaries for the customer presentation card
    const guest = reservation.guest_id;
    const resolvedName = guest ? `${guest.first_name || ""} ${guest.last_name || ""}`.trim() : "Valued Guest";

    return {
      success: true,
      guestName: resolvedName || "Valued Guest",
      email: guest?.email || "",
      totalAmount: Number(reservation.total_amount) || 0,
      checkInDate: reservation.check_in || "",   // Safely map field values
      checkOutDate: reservation.check_out || "", // Safely map field values
    };

  } catch (error: unknown) {
    console.error("❌ CRITICAL: VERIFICATION SERVICE ROUTE CRASHED:", error);
    return {
      success: false,
      error: error instanceof Error 
        ? `[Database Rejection]: ${error.message}` 
        : "An unknown error disrupted database transaction confirmation.",
    };
  }
}