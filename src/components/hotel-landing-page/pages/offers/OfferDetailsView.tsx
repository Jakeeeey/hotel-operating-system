"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Tag, CheckCircle2, Info } from "lucide-react";
import { offers } from "../../data/promo-offer-data";
import { OfferCard } from "./OfferCard";
import { OfferDetailHero } from "./OfferDetailHero";
import { OfferDetailSidebar } from "./OfferDetailSidebar";

const formatPromoDateRange = (startStr: string, endStr: string) => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
  const startDate = new Date(startStr).toLocaleDateString('en-US', options);
  const endDate = new Date(endStr).toLocaleDateString('en-US', { ...options, year: 'numeric' });
  return `${startDate} – ${endDate}`;
};

const formatFullExpiryDate = (dateStr: string) => {
  const date = new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Valid through ${date}`;
};

function OfferDetailsViewInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const campaignDeck = useMemo(() => {
    return offers.reduce((acc, campaign) => {
      acc[campaign.id] = campaign;
      return acc;
    }, {} as Record<string, typeof offers[number]>);
  }, []);

  const activeOfferId = searchParams.get("id");
  const checkinStr = searchParams.get("checkin") || "";
  const checkoutStr = searchParams.get("checkout") || "";
  const guestCount = searchParams.get("guests") || "2";

  const currentOffer = activeOfferId ? campaignDeck[activeOfferId] : null;

  const getForwardPipeline = (promoCode: string) => {
    const params = new URLSearchParams();
    params.set("checkin", checkinStr);
    params.set("checkout", checkoutStr);
    params.set("guests", guestCount);
    params.set("promo", promoCode);
    return params.toString();
  };

  const handleSelectOffer = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", id);
    router.push(`?${params.toString()}`);
  };

  const handleClearSelection = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    router.push(`?${params.toString()}`);
  };


  if (currentOffer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-zinc-900 pb-10">
        <button 
          onClick={handleClearSelection}
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors mb-6 sm:mb-8 group"
        >
          <ArrowLeft size={12} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to All Promotional Offers
        </button>

        <OfferDetailHero 
          title={currentOffer.title}
          subtitle={currentOffer.subtitle}
          badge={currentOffer.badge}
          bannerImage={currentOffer.bannerImage}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-2 space-y-8 sm:space-y-10 order-2 lg:order-1">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-2">
                <Tag size={12} /> Campaign Profile
              </h3>
              <p className="text-zinc-500 font-light leading-relaxed text-sm tracking-wide">
                {currentOffer.description}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">Included Stay Privileges</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentOffer.inclusions.map((inclusion, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-4 border border-zinc-200 rounded-none text-xs text-zinc-700">
                    <CheckCircle2 size={14} strokeWidth={2.5} className="text-zinc-950 shrink-0 mt-0.5" />
                    <span className="font-medium tracking-wide leading-normal">{inclusion}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900 flex items-center gap-1.5">
                <Info size={13} className="text-zinc-400" /> Terms & Structural Regulations
              </h3>
              <ul className="space-y-2.5 list-none pl-0">
                {currentOffer.terms.map((term, idx) => (
                  <li key={idx} className="text-zinc-400 font-light text-xs tracking-wide flex gap-2 items-baseline">
                    <span className="text-zinc-900 font-bold select-none">·</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <OfferDetailSidebar 
            discountType={currentOffer.discountType}
            discountValue={currentOffer.discountValue}
            discountSubtext={currentOffer.discountSubtext}
            checkinStr={checkinStr}
            checkoutStr={checkoutStr}
            code={currentOffer.code}
            forwardPipelineParams={getForwardPipeline(currentOffer.code)}
            expiryText={formatFullExpiryDate(currentOffer.expirationDate)}
          />
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 text-zinc-900 pb-12">
      <div className="mb-8 sm:mb-10 space-y-1.5 text-left">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block">
          Current Active Campaigns
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal tracking-tight text-zinc-950">
          Get promo for a <span className="italic font-light text-zinc-600">cheaper price</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <OfferCard 
            key={offer.id}
            offer={offer}
            onSelect={handleSelectOffer}
            dateRangeText={formatPromoDateRange(offer.validFrom, offer.validUntil)}
          />
        ))}
      </div>
    </div>
  );
}

export function OfferDetailsView() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12"><div className="animate-pulse bg-zinc-100 rounded-sm h-64 w-full"></div></div>}>
      <OfferDetailsViewInner />
    </Suspense>
  );
}