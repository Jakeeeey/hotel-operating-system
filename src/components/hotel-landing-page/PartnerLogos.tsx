"use client"

import { PenLine, Car, Bitcoin, Grid, Circle, Trees } from "lucide-react"

export function PartnerLogos() {
  const partners = [
    { name: "HelloSign", icon: <PenLine size={14} /> },
    { name: "DoorDash", icon: <Car size={14} /> },
    { name: "coinbase", icon: <Bitcoin size={14} /> },
    { name: "Airtable", icon: <Grid size={14} /> },
    { name: "pendo", icon: <Circle size={14} /> },
    { name: "treehouse", icon: <Trees size={14} /> },
  ]

  return (
    <section className="max-w-[1200px] mx-auto py-14 px-10 bg-white select-none">
      <div className="flex justify-center items-center gap-10 flex-wrap">
        {partners.map((partner) => (
          <span
            key={partner.name}
            className="text-[#aaaaaa] opacity-50 text-sm flex items-center gap-1.5 font-semibold tracking-tight"
          >
            {partner.icon}
            <span>{partner.name}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

