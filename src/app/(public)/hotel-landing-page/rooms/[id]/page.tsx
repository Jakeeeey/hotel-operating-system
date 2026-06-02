import { notFound } from "next/navigation";
import { DM_Sans } from "next/font/google";
import { NavBar, Footer } from "@/components/hotel-landing-page";
import { RoomDetailsView } from "@/components/hotel-landing-page/pages/rooms/RoomDetailsView";
import { getRoomByIdService } from "@/components/hotel-landing-page/pages/home/services/room.service";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const room = await getRoomByIdService(Number(id));
    return {
      title: room ? `Book ${room.name} | Luxury Stays` : "Accommodation Profile View",
      description: room ? `Secure exclusive rates for the beautiful ${room.name}.` : "View details.",
    };
  } catch (error) {
    return { title: "Accommodation Profile View" };
  }
}

export default async function HotelLandingPageRooms({ params }: PageProps) {
  const { id } = await params;
  const roomId = Number(id);

  // Guard against non-numeric entries instantly
  if (isNaN(roomId)) {
    notFound();
  }

  let room = null;
  try {
    room = await getRoomByIdService(roomId);
  } catch (error) {
    console.error(`🚨 Failed to fetch room details for ID ${roomId}:`, error);
  }

  // If database is down or record doesn't exist, handle it safely
  if (!room) {
    console.warn(`⚠️ Room ID ${roomId} not found in database. Triggering notFound().`);
    notFound();
  }

  return (
    <main className={`${dmSans.className} min-h-screen bg-white`}>
      <NavBar />
      <div className="pt-24 pb-16">
        {/* Removed redundant client-side Suspense since server component awaits data above */}
        <RoomDetailsView room={room} />
      </div>
      <Footer />
    </main>
  );
}