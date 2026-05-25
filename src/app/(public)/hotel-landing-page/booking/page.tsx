import { DM_Sans } from "next/font/google";
import { NavBar, Footer } from "@/components/hotel-landing-page";
import { BookingView } from "@/components/hotel-landing-page/pages/booking/BookingView";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Secure Resort Suite Reservation Hub | Luxury Stays",
  description: "Complete your premium accommodation reservation details via our secure processing gateway interface.",
};

export default function BookingPage() {
  return (
    <main className={`${dmSans.className} min-h-screen bg-white flex flex-col`}>
      <NavBar />
      <div className="pt-28 pb-20 flex-grow">
        <BookingView />
      </div>
      <Footer />
    </main>
  );
}