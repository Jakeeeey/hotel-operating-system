import { z } from "zod";

const bookingEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url("NEXT_PUBLIC_API_BASE_URL must be a valid configuration URL string."),
  PAYMONGO_SECRET_KEY: z.string().min(1, "PAYMONGO_SECRET_KEY cannot be an empty initialization sequence."),
});
export const bookingEnv = bookingEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  PAYMONGO_SECRET_KEY: process.env.PAYMONGO_SECRET_KEY,
});

export type BookingEnvConfig = z.infer<typeof bookingEnvSchema>;