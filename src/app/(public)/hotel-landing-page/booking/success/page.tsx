import { DM_Sans } from "next/font/google";
import { NavBar, Footer } from "../../../../../modules/hotel-operating-system/hotel-landing-page";
import BookingSuccessPage from "@/modules/hotel-operating-system/hotel-landing-page/pages/booking/success/page";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Booking Success | Luxury Stays",
  description: "Your reservation has been successfully processed.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function SuccessRoute({ searchParams }: PageProps) {
  return (
    <main className={`${dmSans.className} min-h-screen bg-white flex flex-col`}>
      <NavBar />
      <div className="pt-28 pb-20 flex-grow">
        <BookingSuccessPage searchParams={searchParams} />
      </div>
      <Footer />
    </main>
  );
}
