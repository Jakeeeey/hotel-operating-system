import { CalendarLayout } from "@/components/hotel-landing-page/pages/calendar/CalendarLayout";
import { Suspense } from "react";
// Pointing to your new modular layout

export const metadata = {
  title: "Resort Availability Calendar Dashboard",
  description: "Explore our real-time overnight room capacity and plan your stay."
};

export default function AvailabilityPage() {
  return (
    <main className="min-h-screen bg-white pt-6 pb-16">
      <Suspense 
        fallback={
          <div className="max-w-[1400px] mx-auto px-6 py-6 text-sm text-zinc-400">
            Loading interactive calendar…
          </div>
        }
      >
        <CalendarLayout />
      </Suspense>
    </main>
  );
}