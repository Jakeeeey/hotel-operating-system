"use server";

import { headers } from "next/headers";
import { bookingEnv } from "./config";
import { 
  BookingPayload, 
  PaymentActionResponse, 
  PayMongoSessionAttributes, 
  PayMongoSessionResponse 
} from "../../types/paymongo.types";

/**
 * Generates a validated checkout instance via PayMongo APIs using localized domain configuration.
 */
export async function initiatePaymentSession(bookingData: BookingPayload): Promise<PaymentActionResponse> {
  try {
    // 1. Convert standard PHP floating decimal figures into precise integer centavos
    const amountInCentavos: number = Math.round(bookingData.amount * 100);
    
    // 2. Construct base64 authorization header cleanly using our validated config
    const authHeader: string = `Basic ${Buffer.from(`${bookingEnv.PAYMONGO_SECRET_KEY}:`).toString("base64")}`;

    // 3. DYNAMIC HOST DETECTION
    // Instead of relying on API environment variable naming schemes, we read the active 
    // incoming request headers to guarantee the redirect routes back to your Next.js frontend UI context.
    const headerStorage = await headers();
    const host = headerStorage.get("host") || "localhost:3000";
    const protocol = headerStorage.get("x-forwarded-proto") || "http";
    const baseAppUrl = `${protocol}://${host}`;

    const successUrl: string = `${baseAppUrl}/hotel-landing-page/booking/success?reservationId=${bookingData.reservationId}`;
    const cancelUrl: string = `${baseAppUrl}/hotel-landing-page/booking?status=cancelled`;

    // Structuring configuration payload exactly matching PayMongo API schema expectations
    const sessionAttributes: PayMongoSessionAttributes = {
      amount: amountInCentavos,
      currency: "PHP",
      payment_method_types: ["gcash", "card", "qrph", "paymaya", "grab_pay"],
      description: `Reservation Reference Allocation: #${bookingData.reservationId}`,
      line_items: [
        {
          amount: amountInCentavos,
          currency: "PHP",
          name: bookingData.roomName,
          quantity: 1,
        },
      ],
      billing: {
        name: bookingData.guestName,
        email: bookingData.guestEmail,
        phone: bookingData.guestPhone.trim() || undefined, // Evaluates safely to string | undefined now allowed by the interface
      },
      send_email_receipt: false,
      show_description: true,
      show_line_items: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    const response: Response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ data: { attributes: sessionAttributes } }),
    });

    const result = (await response.json()) as PayMongoSessionResponse;

    // 4. ROBUST SERVER TERMINAL DIAGNOSTICS
    // If PayMongo still objects to any parameter data layout, this dumps the exact target parameter error list
    if (!response.ok || result.errors) {
      console.error("❌ --- DETAILED PAYMONGO API REJECTION LOG --- ❌");
      console.error(JSON.stringify(result, null, 2));
      console.error("──────────────────────────────────────────────────");
      
      const errorMsg: string = result.errors?.[0]?.detail || "Failed to initialize standard checkout session context.";
      throw new Error(errorMsg);
    }

    return {
      success: true,
      checkoutUrl: result.data.attributes.checkout_url,
    };

  } catch (error: unknown) {
    console.error("Critical gateway structural breakdown inside paymongo.service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected processing error occurred during gateway communication.",
    };
  }
}