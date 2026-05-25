"use client";

import { Star, User, ArrowRight } from "lucide-react";
import { reviews } from "./data";

export function GuestReviews() {
  // Select exactly 3 reviews to match the 3-column asymmetric layout tracking
  const displayReviews = reviews.slice(0, 3);
  const centerCard = displayReviews[0];
  const rightCards = displayReviews.slice(1, 3);

  return (
    <section className="w-full max-w-[1400px] mx-auto py-20 px-6 ">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center w-full">
        {/* Column 1: Left-Aligned Sidebar Content */}
        <div className="flex flex-col items-start text-left lg:pr-4">
          <span className="text-[#64748b] bg-[#f1f5f9] text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-normal select-none">
            Testimonial
          </span>
          <h2 className="text-3xl md:text-5xl font-normal text-[#0f172a] tracking-tight leading-[1.15] mb-4">
            What our guests <br />
            says about us
          </h2>
          <p className="text-sm text-[#4b5563] font-normal mb-8 leading-relaxed max-w-[280px]">
            knowledge, expertise, advices & confidence
          </p>
          <button className="flex items-center gap-2 bg-[#0f172a] text-white text-md font-normal px-6 py-3.5 rounded-full hover:bg-[#1e293b] transition-colors duration-200 group">
            View all testimonials
            <ArrowRight
              size={14}
              className="text-white group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </div>

        {/* Column 2: Center Track (Single Vertically Staggered Card) */}
        <div className="flex flex-col justify-center w-full lg:pt-12">
          {centerCard && (
            <div className="w-full bg-white rounded-3xl border border-[#f1f5f9] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)] transition-all duration-300">
              {/* Gold/Canary Stars Row */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: Math.floor(centerCard.rating) }).map(
                  (_, s) => (
                    <Star
                      key={s}
                      size={15}
                      className="text-[#eab308] fill-[#eab308]"
                    />
                  ),
                )}
              </div>

              {/* Review Body Text */}
              <p className="text-xs md:text-[13px] text-[#4b5563] leading-relaxed font-normal mb-6">
                {centerCard.review}
              </p>

              {/* Bottom Metadata Profile Row */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-7 h-7 rounded-full bg-[#f1f5f9] flex items-center justify-center shrink-0 overflow-hidden">
                  <User size={13} className="text-[#94a3b8]" />
                </div>
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <span className="font-bold text-[#0f172a] truncate">
                    {centerCard.name}
                  </span>
                  <span className="text-[#e2e8f0] select-none font-light">
                    |
                  </span>
                  <span className="text-[#64748b] font-medium truncate">
                    {centerCard.room}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Right Track (Two Stacked Cards) */}
        <div className="flex flex-col gap-6 w-full">
          {rightCards.map((review) => (
            <div
              key={review.id}
              className="w-full bg-white rounded-3xl border border-[#f1f5f9] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)] transition-all duration-300"
            >
              {/* Gold/Canary Stars Row */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: Math.floor(review.rating) }).map(
                  (_, s) => (
                    <Star
                      key={s}
                      size={15}
                      className="text-[#eab308] fill-[#eab308]"
                    />
                  ),
                )}
              </div>

              {/* Review Body Text */}
              <p className="text-xs md:text-[13px] text-[#4b5563] leading-relaxed font-normal mb-6">
                {review.review}
              </p>

              {/* Bottom Metadata Profile Row */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-7 h-7 rounded-full bg-[#f1f5f9] flex items-center justify-center shrink-0 overflow-hidden">
                  <User size={13} className="text-[#94a3b8]" />
                </div>
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <span className="font-bold text-[#0f172a] truncate">
                    {review.name}
                  </span>
                  <span className="text-[#e2e8f0] select-none font-light">
                    |
                  </span>
                  <span className="text-[#64748b] font-medium truncate">
                    {review.room}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
