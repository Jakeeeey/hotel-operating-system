import { DM_Sans } from "next/font/google";
import { NavBar, Footer } from "../../../../modules/hotel-operating-system/hotel-landing-page";
import { ContactView } from "@/modules/hotel-operating-system/hotel-landing-page/pages/contact/ContactView";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Exclusive Premium Packages & Active Promotional Hub | Luxury Stays",
  description: "Browse dynamic resort reduction packages, flash campaigns, and claim premium rates via our checkout pipeline interfaces.",
};

export default function ContactPage() {
  return (
    <main className={`${dmSans.className} min-h-screen bg-white flex flex-col`}>
      <NavBar />
      <div className="pt-28 pb-20 flex-grow">
        <ContactView />
      </div>
      <Footer />
    </main>
  );
}