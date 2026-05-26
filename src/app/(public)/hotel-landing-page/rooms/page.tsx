import { DM_Sans } from "next/font/google";
import { NavBar, Footer } from "@/components/hotel-landing-page";
import { AllRoomsGrid } from "@/components/hotel-landing-page/pages/rooms/AllRoomsGrid";
import { Suspense } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Premium Suites & Accommodations Directory | Luxury Stays",
  description: "Browse our hand-selected catalog of contemporary suites and villas designed for uncompromised comfort.",
};

export default function AllRoomsDirectoryPage() {
  return (
    <main className={`${dmSans.className} min-h-screen bg-white flex flex-col`}>
      <NavBar />
      <div className="pt-28 pb-20 flex-grow">
        <Suspense fallback={<div className="text-center py-20 text-sm text-zinc-500">Loading accommodations catalog...</div>}>
          <AllRoomsGrid />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}