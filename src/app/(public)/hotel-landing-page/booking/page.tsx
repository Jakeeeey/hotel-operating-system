import { DM_Sans } from "next/font/google";
import { NavBar, Footer } from "../../../../modules/hotel-operating-system/hotel-landing-page";
import { BookingView } from "@/modules/hotel-operating-system/hotel-landing-page/pages/booking/BookingView";
import { Suspense } from "react";
import { getRoomsService } from "@/modules/hotel-operating-system/hotel-landing-page/pages/home/services/room.service";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Secure Resort Suite Reservation Hub | Luxury Stays",
  description: "Complete your premium accommodation reservation details via our secure processing gateway interface.",
};



export default async function BookingPage() {
  const rooms = await getRoomsService();
  
  return (
    <main className={`${dmSans.className} min-h-screen bg-white flex flex-col`}>
      <NavBar />
      <div className="pt-28 pb-20 flex-grow">
        <Suspense fallback={<div className="text-center py-20 text-sm text-zinc-500">Loading booking interface...</div>}>
          <BookingView rooms={rooms} />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}