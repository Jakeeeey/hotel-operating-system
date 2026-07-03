"use client";

import { DM_Sans } from "next/font/google";
import {
  NavBar,
  HeroBanner,
  HotelOverview,
  BrowseRooms,
  GuestReviews,
  PromoOffers,
  PartnerLogos,
  BottomFeatureGrid,
  CallToAction,
  Footer,
  WhyChooseUs,
} from "../../../../modules/hotel-operating-system/hotel-landing-page";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function HotelLandingPage() {
  return (
    <div
      className={`${dmSans.className} min-h-screen scroll-smooth overflow-x-hidden`}
    >
      <NavBar />
      <HeroBanner />
      <div className="bg-white">
        <PromoOffers />
        <WhyChooseUs />
        <HotelOverview />
        <BottomFeatureGrid />
        <BrowseRooms />
        <GuestReviews />
        <PartnerLogos />
        <CallToAction />
      </div>
      <Footer />
    </div>
  );
}
