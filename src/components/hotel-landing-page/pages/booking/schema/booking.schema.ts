import * as z from "zod";

export const bookingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().min(10, "Please provide a valid contact number"),
  gcashNumber: z.string().regex(/^(09|\+639)\d{9}$/, "Provide a valid 11-digit GCash number (e.g., 09171234567)"),
  specialRequests: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
