import { DM_Sans } from "next/font/google";
import { NavBar, Footer } from "../../../../../modules/hotel-operating-system/hotel-landing-page";
import { AllRoomsGrid } from "@/modules/hotel-operating-system/hotel-landing-page/pages/rooms/AllRoomsGrid";
import { getRoomsService } from "@/modules/hotel-operating-system/hotel-landing-page/pages/home/services/room.service";
import { RoomData } from "@/modules/hotel-operating-system/hotel-landing-page/pages/home/types/room.types";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Premium Suites & Accommodations Directory | Luxury Stays",
  description: "Browse our hand-selected catalog of contemporary suites and villas designed for uncompromised comfort.",
};

export default async function AllRoomsDirectoryPage() {
  let roomData: RoomData[] = [];
  
  try {
    roomData = await getRoomsService() || [];
  } catch (error) {
    console.error("🚨 Failed to fetch room catalog overview lists:", error);
    // Provide a safe fallback array so the page interface grid still loads an elegant empty/error state
    roomData = []; 
  }

  return (
    <main className={`${dmSans.className} min-h-screen bg-white flex flex-col`}>
      <NavBar />
      <div className="pt-28 pb-20 flex-grow">
        {/* Render grid directly; to stream this page with an active loading state, use a loading.tsx file in this directory */}
        <AllRoomsGrid initialRooms={roomData} />
      </div>
      <Footer />
    </main>
  );
}