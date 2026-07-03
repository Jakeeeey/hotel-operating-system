"use client";

import { MapPin, ArrowRight } from "lucide-react";
import { AmenityData } from "../../types/types";

interface AmenityCardProps {
  amenity: AmenityData;
  onExplore: (id: string) => void;
}

export function AmenityCard({ amenity, onExplore }: AmenityCardProps) {
  return (
    <div className="group relative w-full aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-950 shadow-md flex flex-col justify-between p-5 sm:p-6">
      {/* Background Media with left-heavy vignette overlay */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={amenity.thumbnailImage} 
          alt={amenity.title} 
          className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-500 brightness-[0.75]" 
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/60 to-black/30" />
      </div>

      {/* Top Meta Line */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-400 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/5">
          {amenity.category}
        </span>
        <div className="flex items-center gap-1 text-zinc-300 font-light text-[10px]">
          <MapPin size={11} className="text-zinc-400 shrink-0" />
          <span className="truncate max-w-[150px]">{amenity.locationDetails}</span>
        </div>
      </div>

      {/* Bottom Content Container Stack */}
      <div className="relative z-10 space-y-3">
        <div className="space-y-1 max-w-[90%]">
          <span className="text-[10px] font-bold font-sans uppercase tracking-[0.2em] text-zinc-400 block">
            {amenity.tagline}
          </span>
          <h3 className="text-base sm:text-lg font-serif font-light italic tracking-wide text-zinc-100 leading-snug truncate">
            {amenity.title}
          </h3>
          <p className="text-zinc-400 font-light text-[11px] tracking-wide line-clamp-1">
            {amenity.subtitle}
          </p>
        </div>

        {/* Action Trigger Row */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <button
            onClick={() => onExplore(amenity.id)}
            className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-950 text-[11px] font-semibold tracking-tight rounded-full transition-all shadow-sm inline-flex items-center gap-2 group/btn"
          >
            <span>Explore Space</span>
            <div className="h-5 w-5 bg-zinc-950 rounded-full flex items-center justify-center text-white transition-transform group-hover/btn:translate-x-0.5">
              <ArrowRight size={10} strokeWidth={3} />
            </div>
          </button>
          <span className="text-[9px] text-zinc-400 font-light tracking-wide">
            {amenity.hoursOfOperation}
          </span>
        </div>
      </div>
    </div>
  );
}