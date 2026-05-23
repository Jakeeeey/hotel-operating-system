"use client";

import { DM_Sans } from "next/font/google";
import {
  NavBar,
  HeroBanner,
  BookingWidget,
  HotelOverview,
  BrowseRooms,
  GuestReviews,
  PromoOffers,
  PartnerLogos,
  BottomFeatureGrid,
  Footer,
} from "@/components/hotel-landing-page";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function HotelLandingPage(): React.JSX.Element {
  return (
    <div
      className={`${dmSans.className} bg-[#f5f5f5] min-h-screen scroll-smooth overflow-x-hidden`}
    >
      <NavBar />
      <HeroBanner />
      <div className="max-w-[1200px] mx-auto bg-white shadow-none relative z-10">
        <HotelOverview />
        <BrowseRooms />
        <GuestReviews />
        <PromoOffers />
        <PartnerLogos />
        <BottomFeatureGrid />
      </div>
      <Footer />
    </div>
  );
}
