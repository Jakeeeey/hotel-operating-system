import { GlobalCalendar } from "@/components/hotel-landing-page/pages/availability/GlobalCalendar";

export const metadata = {
  title: "Resort Availability Calendar Dashboard",
  description: "Explore our real-time overnight room capacity and plan your stay."
};

export default function AvailabilityPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <GlobalCalendar />
    </main>
  );
}