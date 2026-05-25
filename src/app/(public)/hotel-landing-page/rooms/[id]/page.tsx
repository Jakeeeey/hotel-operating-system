import { notFound } from "next/navigation";
import { DM_Sans } from "next/font/google";
import { NavBar, Footer, rooms } from "@/components/hotel-landing-page";
import { RoomDetailsView } from "@/components/hotel-landing-page/pages/rooms/RoomDetailsView";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate Dynamic SEO Header parameters
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const room = rooms.find((r) => r.id === Number(id));
  
  return {
    title: room ? `Book ${room.name} | Luxury Stays` : "Accommodation Profile View",
    description: room ? `Secure exclusive rates for the beautiful ${room.name}.` : "View details.",
  };
}

export default async function HotelLandingPageRooms({ params }: PageProps) {
  const { id } = await params;
  const room = rooms.find((r) => r.id === Number(id));

  // Catch non-existent room profiles immediately
  if (!room) {
    notFound();
  }

  return (
    <main className={`${dmSans.className} min-h-screen bg-white`}>
      <NavBar />
      <div className="pt-24 pb-16">
        <RoomDetailsView room={room} />
      </div>
      <Footer />
    </main>
  );
}