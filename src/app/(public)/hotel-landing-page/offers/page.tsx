import { DM_Sans } from "next/font/google";
import { NavBar, Footer } from "@/components/hotel-landing-page";
import { OfferDetailsView } from "@/components/hotel-landing-page/pages/offers/OfferDetailsView";
import { Suspense } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Exclusive Premium Packages & Active Promotional Hub | Luxury Stays",
  description: "Browse dynamic resort reduction packages, flash campaigns, and claim premium rates via our checkout pipeline interfaces.",
};

export default function OfferDetailsPage() {
  return (
    <main className={`${dmSans.className} min-h-screen bg-white flex flex-col`}>
      <NavBar />
      <div className="pt-28 pb-20 flex-grow">
        <Suspense fallback={<div className="text-center py-20 text-sm text-zinc-500">Loading promotional campaigns...</div>}>
          <OfferDetailsView />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}