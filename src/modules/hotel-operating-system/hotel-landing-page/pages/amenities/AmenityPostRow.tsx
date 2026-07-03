"use client";

import { Clock, MapPin, CheckCircle2, ShieldAlert } from "lucide-react";
import { AmenityData } from "../../types/types";

interface AmenityPostRowProps {
  amenity: AmenityData;
  index: number;
}

export function AmenityPostRow({ amenity, index }: AmenityPostRowProps) {
  // Alternate the image and text alignment based on the item index for a premium editorial flow
  const isImageLeft = index % 2 === 0;

  return (
    <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center py-12 md:py-20 border-b border-zinc-100 last:border-none">
      
      {/* Image Block Canvas */}
      <div className={`lg:col-span-7 relative w-full aspect-[16/10] md:aspect-[16/9] bg-zinc-100 overflow-hidden rounded-2xl shadow-sm ${
        isImageLeft ? "order-1" : "order-1 lg:order-2"
      }`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={amenity.heroImage} 
          alt={amenity.title} 
          className="w-full h-full object-cover hover:scale-101 transition-transform duration-700 ease-out brightness-[0.95]" 
        />
        <div className="absolute top-4 left-4">
          <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 bg-white/90 backdrop-blur-sm text-zinc-950 rounded-none border border-zinc-200">
            {amenity.category}
          </span>
        </div>
      </div>

      {/* Editorial Content Text Block */}
      <div className={`lg:col-span-5 space-y-6 ${
        isImageLeft ? "order-2" : "order-2 lg:order-1"
      }`}>
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 block">
            {amenity.tagline}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-zinc-950 tracking-tight leading-tight">
            {amenity.title}
          </h2>
          <p className="text-zinc-400 font-serif italic text-xs tracking-wide">
            {amenity.subtitle}
          </p>
        </div>

        <p className="text-zinc-500 font-light leading-relaxed text-sm tracking-wide">
          {amenity.description}
        </p>

        {/* Location & Schedule Logistics Row */}
        <div className="flex flex-wrap gap-4 bg-zinc-50 border border-zinc-200 p-3.5 font-medium text-[11px] text-zinc-700">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-zinc-400 shrink-0" />
            <span>{amenity.hoursOfOperation}</span>
          </div>
          <div className="hidden sm:block text-zinc-300">|</div>
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-zinc-400 shrink-0" />
            <span className="truncate">{amenity.locationDetails}</span>
          </div>
        </div>

        {/* Space Highlights Bullet Layout */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-950">Features & Inclusions</h4>
          <div className="space-y-2">
            {amenity.highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-zinc-600 font-light">
                <CheckCircle2 size={13} className="text-zinc-950 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Access Guidelines Accordion Footer */}
        <div className="pt-4 border-t border-zinc-100 space-y-1.5">
          <h5 className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <ShieldAlert size={12} className="text-zinc-400" /> Ground Regulations
          </h5>
          <ul className="space-y-1 list-none pl-0 text-[11px] text-zinc-400 font-light tracking-wide">
            {amenity.guidelines.slice(0, 2).map((policy, idx) => (
              <li key={idx} className="flex gap-1.5 items-baseline">
                <span className="text-zinc-950 font-bold select-none">·</span>
                <span>{policy}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </article>
  );
}