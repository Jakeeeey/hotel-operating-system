"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function CallToAction() {
  return (
    <section className="w-full max-w-[1400px] mx-auto py-8 px-4">
      <div className="relative w-full h-[380px] md:h-[480px] rounded-[24px] overflow-hidden flex flex-col items-center justify-center text-center px-4 shadow-sm">
        {/* Background Image - using a beautiful tropical house/sky image to match the vibe */}
        <Image
          fill
          unoptimized
          src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop"
          alt="Tropical house and blue sky"
          className="object-cover"
          sizes="(max-width: 1400px) 100vw, 1400px"
        />
        {/* Subtle overlay to ensure text remains readable against bright skies */}
        <div className="absolute inset-0 bg-black/5" />

        <div className="relative z-10 flex flex-col items-center max-w-3xl mt-[-40px]">
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-white font-medium tracking-tight mb-5 leading-[1.15]">
            One Click Away from <br />
            Your <span className="font-serif italic">Perfect Stay</span>
          </h2>
          <p className="text-white/95 text-[15px] md:text-base mb-8 font-light">
            Book your favorite hotel in minutes, with instant confirmation.
          </p>
          <button className="flex items-center gap-4 bg-[#1c1c1e] text-white rounded-full pl-6 pr-2 py-2 hover:bg-black transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 group">
            <span className="font-medium text-[15px]">Book Now</span>
            <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:translate-x-0.5">
              <ArrowRight size={18} strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
