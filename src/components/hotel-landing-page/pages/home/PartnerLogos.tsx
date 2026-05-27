"use client";

import { PenLine, Car, Bitcoin, Grid, Circle, Trees } from "lucide-react";

export function PartnerLogos() {
  const partners = [
    { name: "HelloSign", icon: <PenLine size={30} strokeWidth={2} /> },
    { name: "DoorDash", icon: <Car size={30} strokeWidth={2} /> },
    { name: "coinbase", icon: <Bitcoin size={30} strokeWidth={2} /> },
    { name: "Airtable", icon: <Grid size={30} strokeWidth={2} /> },
    { name: "pendo", icon: <Circle size={30} strokeWidth={2} /> },
    { name: "treehouse", icon: <Trees size={30} strokeWidth={2} /> },
  ];

  return (
    <section className="w-full max-w-[1400px] mx-auto py-14 px-4 overflow-hidden relative select-none">
      {/* Dynamic Keyframe Animation Styles Tag Injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-loop {
          animation: marquee 25s linear infinite;
        }
      `,
        }}
      />

      {/* Horizontal Transparent Edge-Blending Shadow Overlay Mask */}
      <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-bg to-transparent z-10 pointer-events-none" />

      {/* Main Row Content Conveyor Track Flex Strip */}
      <div className="flex w-full overflow-hidden">
        {/* Track Track Chain 1 */}
        <div className="flex shrink-0 items-center justify-around gap-16 pr-16 animate-marquee-loop min-w-full">
          {partners.map((partner, idx) => (
            <span
              key={`track1-${partner.name}-${idx}`}
              className="text-[#9e9e9e] opacity-65 text-2xl flex items-center gap-2.5 font-semibold tracking-tight hover:opacity-100 transition-opacity duration-200"
            >
              <span className="text-[#a3a3a3]">{partner.icon}</span>
              <span>{partner.name}</span>
            </span>
          ))}
        </div>

        {/* Track Track Chain 2 (Duplicate Back-to-Back Shadow Clone Layer) */}
        <div
          className="flex shrink-0 items-center justify-around gap-16 pr-16 animate-marquee-loop min-w-full"
          aria-hidden="true"
        >
          {partners.map((partner, idx) => (
            <span
              key={`track2-${partner.name}-${idx}`}
              className="text-[#9e9e9e] opacity-65 text-2xl flex items-center gap-2.5 font-semibold tracking-tight hover:opacity-100 transition-opacity duration-200"
            >
              <span className="text-[#a3a3a3]">{partner.icon}</span>
              <span>{partner.name}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
