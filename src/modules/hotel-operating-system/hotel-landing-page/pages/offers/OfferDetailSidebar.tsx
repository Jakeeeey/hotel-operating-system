"use client";

import { Calendar, Percent, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

interface OfferDetailSidebarProps {
  discountType: string;
  discountValue: number;
  discountSubtext: string;
  checkinStr: string;
  checkoutStr: string;
  code: string;
  forwardPipelineParams: string;
  expiryText: string;
}

export function OfferDetailSidebar({
  discountType,
  discountValue,
  discountSubtext,
  checkinStr,
  checkoutStr,
  code,
  forwardPipelineParams,
  expiryText,
}: OfferDetailSidebarProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-none p-5 sm:p-6 space-y-6 lg:sticky lg:top-32 order-1 lg:order-2">
      <div className="flex justify-between items-baseline pb-4 border-b border-zinc-100">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Calculated Incentive</span>
        <div className="flex items-baseline gap-1 text-zinc-950">
          <span className="text-2xl sm:text-3xl font-serif font-normal">
            {discountType === "percentage" ? `${discountValue}%` : `$${discountValue}`}
          </span>
          <span className="text-xs sm:text-sm tracking-wider uppercase font-bold ml-1 text-zinc-800">
            {discountSubtext}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Current Window Parameters</span>
        <div className="bg-zinc-50 border border-zinc-200 divide-y divide-zinc-200 text-[11px] font-medium tracking-wide text-zinc-700">
          <div className="p-3 flex items-center justify-between gap-2">
            <span className="text-zinc-400 uppercase font-bold text-[9px] tracking-wider flex items-center gap-1.5 shrink-0">
              <Calendar size={11} /> Timeline
            </span>
            <span className="text-right truncate">{checkinStr} — {checkoutStr}</span>
          </div>
          <div className="p-3 flex items-center justify-between">
            <span className="text-zinc-400 uppercase font-bold text-[9px] tracking-wider flex items-center gap-1.5">
              <Percent size={11} /> Promo Token
            </span>
            <span className="font-mono bg-zinc-950 text-white px-2 py-0.5 text-[10px] font-bold tracking-normal">
              {code}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Link 
          href={`/hotel-landing-page/rooms?${forwardPipelineParams}`}
          className="w-full py-3.5 sm:py-4 bg-zinc-950 hover:bg-black text-white rounded-none text-[10px] font-bold uppercase tracking-[0.15em] border border-zinc-950 transition-colors text-center flex items-center justify-center gap-2 group/btn"
        >
          Apply Discount 
          <ArrowRight size={12} strokeWidth={2.5} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="pt-4 border-t border-zinc-100 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        <Clock size={13} className="text-zinc-400" />
        <span>{expiryText}</span>
      </div>
    </div>
  );
}