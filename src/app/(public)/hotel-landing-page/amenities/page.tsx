import { DM_Sans } from "next/font/google";
import { NavBar, Footer } from "../../../../modules/hotel-operating-system/hotel-landing-page";
import { AmenitiesView } from "@/modules/hotel-operating-system/hotel-landing-page/pages/amenities/AmenitiesView";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Resort Amenities & Guest Spaces | Luxury Hotel",
  description: "Explore our architectural wellness havens, subterranean tasting cellars, and ocean-facing infinity pools designed for absolute elevation.",
};

export default function AmenitiesPage() {
  return (
    <main className={`${dmSans.className} min-h-screen bg-white flex flex-col`}>
      <NavBar />
      {/* Kept padding top (pt-28) consistent with your offers page layout context */}
      <div className="pt-28 pb-20 flex-grow">
        <AmenitiesView />
      </div>
      <Footer />
    </main>
  );
}