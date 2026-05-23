"use client"

import { Globe, ArrowRight } from "lucide-react"

export function BottomFeatureGrid(): React.JSX.Element {
  return (
    <section className="max-w-[1200px] mx-auto py-14 px-10 bg-white">
      <div className="grid grid-cols-2 gap-4 h-[420px]">
        {/* Left Column */}
        <div className="flex flex-col gap-4 h-full">
          {/* Top-Left Card */}
          <div className="bg-[#1a1a1a] rounded-[16px] p-7 flex flex-col justify-between flex-1">
            <div>
              <Globe size={18} className="text-white mb-4 self-start" />
              <h3 className="text-[20px] font-bold text-white leading-snug mb-1">
                Experience Luxury, Your Way
              </h3>
              <p className="text-[12px] text-[#aaaaaa]">
                Reserve your room and let us handle the rest.
              </p>
            </div>
            <button className="border border-white text-white rounded-[8px] px-4 py-2 text-xs flex items-center gap-1.5 w-fit hover:bg-white hover:text-[#111111] transition-colors duration-200 font-medium">
              Book Your Stay
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Bottom-Left Card */}
          <div className="relative rounded-[16px] overflow-hidden flex-1">
            <img
              src="https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=500"
              alt="Resort rooms"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute bottom-0 left-0 p-5 z-10">
              <p className="text-[11px] text-white/75 mb-0.5 font-medium">Rooms Available</p>
              <p className="text-[28px] font-extrabold text-white leading-none">48</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="relative rounded-[16px] overflow-hidden h-full">
          <img
            src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600"
            alt="Luxury hotel interior"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Bottom-only gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/60 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-center">
            <p className="text-xl font-bold text-white leading-snug">
              Beyond accommodation, creating memories of a lifetime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

