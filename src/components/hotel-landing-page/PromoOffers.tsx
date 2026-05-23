"use client"

import { Tag, ArrowRight } from "lucide-react"

export function PromoOffers(){ 
  const promos = [
    {
      id: 1,
      badge: "Valid only on 14 Jan - 28 Jan 2025",
      label: "Early Bird Discount — Azure Oasis",
      percentage: "30%",
      terms: "*Book 30 days in advance. T&C apply.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
    },
    {
      id: 2,
      badge: "Valid only on 20 Feb - 10 Mar 2025",
      label: "Honeymoon Special — Azure Oasis",
      percentage: "50%",
      terms: "*On Honeymoon Suite. T&C apply.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    },
  ]

  return (
    <section className="max-w-[1200px] mx-auto py-14 px-10 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[26px] font-bold text-[#111111]">
          Get promo for a cheaper price
        </h2>
        <button className="flex items-center gap-1 text-xs text-[#111111] font-semibold hover:underline transition-all duration-200">
          See All
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Promo Cards */}
      <div className="grid grid-cols-2 gap-5">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="relative bg-[#2c2c2c] rounded-[16px] overflow-hidden min-h-[170px] flex items-stretch animate-fade-in"
          >
            {/* Left Content (60% width) */}
            <div className="w-[60%] shrink-0 relative z-10 p-6 flex flex-col justify-center">
              {/* Date Badge: positioned at right-[42%] so it stays on the dark background */}
              <span className="absolute top-3 right-[42%] bg-white/10 text-white text-[10px] rounded-full px-2.5 py-0.5 border border-white/20 z-20 whitespace-nowrap">
                {promo.badge}
              </span>
              {/* Icon */}
              <div className="w-10 h-10 bg-[#f5a623] rounded-full flex items-center justify-center mb-2.5">
                <Tag size={18} className="text-white" />
              </div>
              <p className="text-xs text-white/90 mb-1">{promo.label}</p>
              <p className="text-[52px] font-extrabold text-white leading-none">
                {promo.percentage}
              </p>
              <p className="text-[10px] text-white/50 mt-2">{promo.terms}</p>
            </div>
            {/* Right Image (40% width, absolute) */}
            <div className="absolute right-0 top-0 bottom-0 w-[40%]">
              <img
                src={promo.image}
                alt={promo.label}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

