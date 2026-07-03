"use client";

import { Tag, ArrowRight } from "lucide-react";
import Image from "next/image";

export function PromoOffers() {
  const promos = [
    {
      id: 1,
      badge: "Valid only on 14 Jan - 20 Jan 2024",
      label: "Get Extra Discount at Azure Oasis Hotel",
      percentage: "50%",
      terms: "*with Terms and Condition",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
    },
    {
      id: 2,
      badge: "Valid only on 16 Jan - 28 Jan 2024",
      label: "Exclusive Deals Just For You",
      percentage: "75%",
      terms: "*with Terms and Condition",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    },
  ];

  return (
    <section className="w-full max-w-[1400px] mx-auto py-16 md:py-20 px-4">
      {/* Header Action Row */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[24px] md:text-3xl font-normal tracking-tight">
          Get promo for a <span className="font-serif italic font-normal">cheaper price</span>
        </h2>
        <button className="flex items-center gap-2 bg-zinc-900 text-white text-[14px] font-medium px-5 py-2.5 rounded-md hover:bg-black transition-all duration-200 group shrink-0">
          See All
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid Container Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="relative rounded-xl overflow-hidden min-h-[240px] md:min-h-[260px] flex flex-col justify-between p-6 md:p-8"
          >
            {/* Background Image Layer — Fully spanning container boundaries */}
            <Image
              fill
              unoptimized
              src={promo.image}
              alt={promo.label}
              className="object-cover z-0"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Tinted Background Overlay Mask to preserve text legibility */}
            <div className="absolute inset-0 bg-black/45 z-10" />

            {/* Top Row Segment Area */}
            <div className="relative z-20 flex justify-between items-start w-full">
              {/* Yellow Round Tag Icon */}
              <div className="w-9 h-9 bg-[#f5a623] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <Tag size={16} className="text-white fill-current" />
              </div>

              {/* Date Validity Badge */}
              <span className="bg-transparent/60 backdrop-blur-sm text-white text-sm font-light rounded-full px-3 py-1.5 border border-white/10 tracking-wide">
                {promo.badge}
              </span>
            </div>

            {/* Bottom Content Area */}
            <div className="relative z-20 text-white mt-auto pt-6">
              <p className="text-[14px] md:text-xl font-medium text-white/95 tracking-tight mb-1 max-w-[280px] md:max-w-[320px] leading-snug">
                <span className="font-serif italic font-normal">{promo.label}</span>
              </p>
              <p className="text-[48px] md:text-7xl font-light tracking-tighter leading-none my-1">
                {promo.percentage}
              </p>

              {/* Book Now CTA */}
              <button className="flex items-center gap-3 bg-white text-black rounded-full pl-5 pr-2 py-1.5 mt-5 hover:bg-zinc-100 transition-all duration-200 group w-fit shadow-sm">
                <span className="font-medium text-[13px]">Claim Offer</span>
                <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ArrowRight size={13} strokeWidth={2.5} />
                </div>
              </button>

              <p className="text-[12px] tracking-normal font-light mt-4 text-white/50">
                {promo.terms}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
