import { directus } from "@/modules/hotel-operating-system/hotel-landing-page/pages/booking/lib/directus";
import { CalendarLayout } from "@/modules/hotel-operating-system/hotel-landing-page/pages/calendar/CalendarLayout";
import { Suspense } from "react";
import { readItems } from "@directus/sdk";
import { CalendarRoom } from "@/modules/hotel-operating-system/hotel-landing-page/pages/calendar/types/types";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Resort Availability Calendar Dashboard",
  description: "Explore our real-time overnight room capacity and plan your stay."
};

export default async function AvailabilityPage() {

  const roomsData = await directus.request(
    readItems("rooms_hos", {
      fields: ["id", "room_number", { type_id: ["max_adults", "max_children"] }]
    })
  );
  
  return (
    <main className="min-h-screen bg-white pt-6 pb-16">
      <Suspense 
        fallback = {
          <div className="max-w-[1400px] mx-auto px-6 py-6 text-sm text-zinc-400">
            Loading interactive calendar…
          </div>
        }
      >
        <CalendarLayout rooms={roomsData as CalendarRoom[]} />
      </Suspense>
    </main>
  );
}