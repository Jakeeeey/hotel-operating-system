export interface PayMongoBillingInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface PayMongoLineItem {
  amount: number; // In centavos
  currency: "PHP";
  name: string;
  quantity: number;
}

export interface PayMongoSessionAttributes {
  amount: number; // In centavos
  currency: "PHP";
  payment_method_types: ("gcash" | "card" | "paymaya" | "grab_pay" | "qrph")[];
  description: string;
  line_items: PayMongoLineItem[];
  billing: PayMongoBillingInfo;
  send_email_receipt: boolean;
  show_description: boolean;
  show_line_items: boolean;
  success_url: string;
  cancel_url: string;
}

export interface PayMongoSessionResponse {
  data: {
    id: string;
    type: "checkout_session";
    attributes: {
      checkout_url: string;
      status: "active" | "expired" | "paid";
    };
  };
  errors?: Array<{
    detail: string;
    code: string;
  }>;
}

export interface BookingPayload {
  amount: number
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomName: string;
  reservationId: string;
}

export interface PaymentActionResponse {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}