"use client";

import { Tag, ArrowRight } from "lucide-react";
import { OfferCampaignData } from "../../types/types";

interface OfferCardProps {
  offer: OfferCampaignData;
  onSelect: (id: string) => void;
  dateRangeText: string;
}

export function OfferCard({ offer, onSelect, dateRangeText }: OfferCardProps) {
  return (
    <div className="group relative w-full aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-950 shadow-md flex flex-col justify-between p-5 sm:p-6">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={offer.bannerImage} 
          alt={offer.title} 
          className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-500 brightness-[0.75]" 
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/60 to-black/30" />
      </div>

      {/* Card Header Indicators */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="h-8 w-8 bg-[#F59E0B] rounded-xl flex items-center justify-center shadow-md">
          <Tag size={14} className="text-white fill-white/10 transform -rotate-45" />
        </div>
        <span className="text-[9px] font-medium tracking-wide text-zinc-200 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          Valid only: {dateRangeText}
        </span>
      </div>

      {/* Card Body & Call To Action */}
      <div className="relative z-10 space-y-4">
        <div className="space-y-1 max-w-[85%]">
          <h3 className="text-sm font-serif font-light italic tracking-wide text-zinc-100 leading-snug line-clamp-2">
            {offer.title}
          </h3>
          <div className="flex items-baseline gap-1.5 text-white">
            <span className="text-4xl sm:text-5xl font-bold font-sans tracking-tight">
              {offer.discountType === "percentage" ? `${offer.discountValue}%` : `$${offer.discountValue}`}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
              {offer.discountSubtext}
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <button
            onClick={() => onSelect(offer.id)}
            className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-950 text-[11px] font-semibold tracking-tight rounded-full transition-all shadow-sm inline-flex items-center gap-2 group/btn"
          >
            <span>Claim Offer</span>
            <div className="h-5 w-5 bg-zinc-950 rounded-full flex items-center justify-center text-white transition-transform group-hover/btn:translate-x-0.5">
              <ArrowRight size={10} strokeWidth={3} />
            </div>
          </button>
          <span className="text-[9px] text-zinc-400 font-light tracking-wide">
            *with Terms and Conditions
          </span>
        </div>
      </div>
    </div>
  );
}