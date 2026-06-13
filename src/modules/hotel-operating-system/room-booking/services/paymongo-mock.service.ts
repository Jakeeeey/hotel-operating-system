export interface MockBookingPayload {
  amount: number;
  guestName: string;
  guestEmail: string;
  roomName: string;
  reservationId: string;
}

export interface MockPaymentActionResponse {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

export async function initiateMockPaymentSession(payload: MockBookingPayload): Promise<MockPaymentActionResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  try {
    const mockSessionId = Math.random().toString(36).substring(2, 15);
    return {
      success: true,
      checkoutUrl: `https://checkout.paymongo.com/mock-session-${mockSessionId}?reservationId=${payload.reservationId}&amount=${payload.amount}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to initiate mock checkout session.",
    };
  }
}
