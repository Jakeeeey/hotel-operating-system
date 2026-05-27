"use client";

import React from "react";
import {
  Plane,
  Waves,
  UtensilsCrossed,
  Sparkles,
  Wifi,
  Dumbbell,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";

export function HotelOverview() {
  const stats = [
    { value: "48", label: "Luxury Rooms & Villas" },
    { value: "3", label: "Private Infinity Pools" },
    { value: "5★", label: "Service Rating" },
    { value: "24/7", label: "Personal Concierge" },
  ];

  const amenities = [
    {
      icon: <Plane size={18} className="text-zinc-800" />,
      label: "Airport Shuttle",
      desc: "Complimentary luxury transport",
    },
    {
      icon: <Waves size={18} className="text-zinc-800" />,
      label: "Private Beach",
      desc: "Direct access to white sands",
    },
    {
      icon: <UtensilsCrossed size={18} className="text-zinc-800" />,
      label: "Fine Dining",
      desc: "Michelin-starred culinary experiences",
    },
    {
      icon: <Sparkles size={18} className="text-zinc-800" />,
      label: "Spa & Wellness",
      desc: "Rejuvenating holistic therapies",
    },
    {
      icon: <Wifi size={18} className="text-zinc-800" />,
      label: "Free WiFi",
      desc: "High-speed coverage everywhere",
    },
    {
      icon: <Dumbbell size={18} className="text-zinc-800" />,
      label: "Fitness Center",
      desc: "State-of-the-art training gear",
    },
  ];

  return (
    <section className="w-full max-w-[1400px] mx-auto py-16 md:py-24 px-4 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column — Content, Stats & Interactive Amenities Grid */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full">
            {/* Tiny tagline indicator */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <span className="text-[13px] font-semibold text-zinc-500 tracking-wider uppercase">
                Hotel Overview
              </span>
            </div>

            {/* Premium Header */}
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-[1.15] mb-5">
              Your Perfect <span className="font-serif italic font-normal text-zinc-800">Staycation</span> Awaits
            </h2>

            {/* Description */}
            <p className="text-zinc-500 text-[15px] leading-relaxed max-w-2xl mb-10 font-light">
              Nestled between the turquoise lagoon and pristine white-sand beaches, Azure
              Oasis offers an unrivaled escape from the everyday. Every details is curated with refined elegance to provide you with a sanctuary of pure tranquility and luxury.
            </p>

            {/* Stat Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-zinc-100 mb-10 w-full text-center lg:text-left">
              {stats.map((stat) => (
                <div key={stat.label} className="group">
                  <div className="text-3xl md:text-4xl font-light tracking-tight text-zinc-900 mb-1 group-hover:text-black transition-colors duration-200">
                    {stat.value}
                  </div>
                  <div className="text-[12px] text-zinc-400 font-normal leading-normal">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Amenities Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {amenities.map((amenity) => (
                <div
                  key={amenity.label}
                  className="flex flex-col items-center lg:items-start text-center lg:text-left gap-3 p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50/50 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-all duration-300 shrink-0">
                    <span className="group-hover:scale-110 group-hover:text-white transition-all duration-300">
                      {React.cloneElement(amenity.icon, {
                        className: "text-zinc-800 group-hover:text-white transition-colors duration-300"
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col items-center lg:items-start">
                    <h4 className="text-[14px] font-semibold text-zinc-900 mb-0.5 flex items-center justify-center lg:justify-start gap-1">
                      {amenity.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 text-zinc-400" />
                    </h4>
                    <p className="hidden md:block text-[12px] text-zinc-400 font-light leading-snug">
                      {amenity.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Elegant Asymmetrical Magazine-style Images */}
        <div className="lg:col-span-5 grid grid-cols-12 gap-4 relative">
          {/* Main Tall Image */}
          <div className="col-span-8 overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-500 group">
            <Image
              width={600}
              height={800}
              unoptimized
              src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop"
              alt="Resort pool aerial view"
              className="w-full h-[400px] md:h-[480px] object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            />
          </div>

          {/* Secondary Stacked Column */}
          <div className="col-span-4 flex flex-col gap-4 justify-between h-full">
            {/* Small Detail Image 1 */}
            <div className="overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-500 group h-[190px] md:h-[230px]">
              <Image
                width={300}
                height={400}
                unoptimized
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&auto=format&fit=crop"
                alt="Luxury room interior design"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              />
            </div>
            
            {/* Small Detail Image 2 - Adds depth to the layout */}
            <div className="overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-500 group h-[190px] md:h-[230px]">
              <Image
                width={300}
                height={400}
                unoptimized
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop"
                alt="Resort architecture detail"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
