"use client";

import {
  Plane,
  Waves,
  UtensilsCrossed,
  Sparkles,
  Wifi,
  Dumbbell,
} from "lucide-react";
import Image from "next/image";

export function HotelOverview() {
  const stats = [
    { value: "48", label: "Rooms & Villas" },
    { value: "3", label: "Private Pools" },
    { value: "5★", label: "Service Rating" },
    { value: "24/7", label: "Concierge" },
  ];

  const amenities: { icon: React.ReactNode; label: string }[] = [
    {
      icon: <Plane size={15} className="text-[#444444]" />,
      label: "Airport Shuttle",
    },
    {
      icon: <Waves size={15} className="text-[#444444]" />,
      label: "Private Beach",
    },
    {
      icon: <UtensilsCrossed size={15} className="text-[#444444]" />,
      label: "Fine Dining",
    },
    {
      icon: <Sparkles size={15} className="text-[#444444]" />,
      label: "Spa & Wellness",
    },
    { icon: <Wifi size={15} className="text-[#444444]" />, label: "Free WiFi" },
    {
      icon: <Dumbbell size={15} className="text-[#444444]" />,
      label: "Fitness Center",
    },
  ];

  return (
    <section className="max-w-[1400px] mx-auto py-4 px-4">
      <div className="grid grid-cols-[55%_45%] gap-10 items-start">
        {/* Left */}
        <div>
          <h2 className="text-[26px] font-bold text-[#111111] mb-1.5">
            Your Perfect Staycation Awaits
          </h2>
          <p className="text-sm text-[#6b6b6b] leading-relaxed max-w-[520px] mb-8">
            Nestled between the turquoise lagoon and white-sand beaches, Azure
            Oasis offers an unrivaled escape from the everyday. Every detail is
            crafted for your comfort.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-8 mb-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-extrabold text-[#111111]">
                  {stat.value}
                </div>
                <div className="text-xs text-[#6b6b6b] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {amenities.map((amenity) => (
              <div
                key={amenity.label}
                className="flex items-center gap-2 text-[13px] text-[#444444]"
              >
                {amenity.icon}
                <span>{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Images */}
        <div className="flex flex-col gap-3">
          <Image
            width={100}
            height={100}
            unoptimized
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600"
            alt="Resort pool aerial"
            className="w-full h-[185px] object-cover rounded-[14px]"
          />
          <Image
            width={100}
            height={100}
            unoptimized
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600"
            alt="Luxury room interior"
            className="w-full h-[185px] object-cover rounded-[14px]"
          />
        </div>
      </div>
    </section>
  );
}
