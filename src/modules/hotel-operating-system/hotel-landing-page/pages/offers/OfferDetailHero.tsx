"use client";

interface OfferDetailHeroProps {
  title: string;
  subtitle: string;
  badge: string;
  bannerImage: string;
}

export function OfferDetailHero({ title, subtitle, badge, bannerImage }: OfferDetailHeroProps) {
  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] min-h-[260px] bg-zinc-100 overflow-hidden rounded-xl mb-8 sm:mb-12 border border-zinc-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage} alt={title} className="w-full h-full object-cover brightness-[0.85]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 sm:p-8 md:p-12">
        <div className="max-w-2xl space-y-2 sm:space-y-3">
          <span className="inline-block text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 bg-white text-zinc-950 rounded-none">
            {badge}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-normal tracking-tight text-white leading-tight">
            {title}
          </h1>
          <p className="text-zinc-300 font-light text-[11px] sm:text-xs md:text-sm tracking-wide max-w-xl">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}