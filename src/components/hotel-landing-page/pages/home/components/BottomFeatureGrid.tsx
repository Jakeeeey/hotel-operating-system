"use client";

import { Globe, ArrowRight } from "lucide-react";
import Image from "next/image";

export function BottomFeatureGrid() {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-4">
      <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-[1fr_1fr] gap-4 w-full md:h-[520px] lg:h-[580px]">
        {/* 1. Top-Left Experience Card */}
        <div className="md:col-span-5 md:row-start-1 md:row-end-2 bg-[#1a1a1a] rounded-xl p-6 lg:p-8 flex flex-col justify-between min-h-[190px] md:min-h-0">
          <div>
            <div className="bg-zinc-400/10 w-11 h-11 rounded-xl flex items-center justify-center mb-5 lg:mb-8">
              <Globe size={20} className="text-white" />
            </div>
            <h3 className="text-2xl lg:text-[28px] font-semibold text-white tracking-tight leading-snug mb-2">
              Explore more to get your <span className="font-serif italic font-normal text-white/95">comfort zone</span>
            </h3>
            <p className="text-sm lg:text-md text-[#a3a3a3] font-normal">
              Book your perfect stay with us.
            </p>
          </div>

          <button className="mt-4 border border-white bg-white text-black rounded-md px-5 py-2 text-sm flex items-center gap-2 w-fit hover:bg-transparent hover:text-white transition-colors duration-200 font-medium">
            Book Now
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* 2. Bottom-Left Hotel Available Card */}
        <div className="relative md:col-span-5 md:row-start-2 md:row-end-3 rounded-xl overflow-hidden min-h-[190px] md:min-h-0 w-full">
          <Image
            fill
            unoptimized
            src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600"
            alt="Hotel room interior"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 p-4 sm:p-6 z-10 text-white">
            <p className="text-md text-white/85 mb-0.5 font-medium">
              Hotel <span className="font-serif italic font-normal text-white/90">Available</span>
            </p>
            <p className="text-3xl lg:text-4xl font-medium tracking-tight leading-none">
              1,764,980
            </p>
          </div>
        </div>

        {/* 3. Right Column Large Hero Card */}
        <div className="md:col-span-7 md:row-span-2 relative rounded-xl overflow-hidden min-h-[190px] md:min-h-0">
          <Image
            fill
            unoptimized
            src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1000"
            alt="Luxury hotel interior room panorama"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-black/25" />

          <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12 z-20">
            <p className="text-xl sm:text-2xl lg:text-[32px] font-medium text-white leading-tight tracking-tight text-center max-w-[480px]">
              Beyond accommodation, creating <span className="font-serif italic font-normal text-white/95">memories of a lifetime</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
