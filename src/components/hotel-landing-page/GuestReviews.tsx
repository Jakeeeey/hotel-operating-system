"use client";

import { Star, Crown, ThumbsUp, ArrowRight } from "lucide-react";
import { reviews } from "./data";

export function GuestReviews() {
  return (
    <section className="max-w-[1400px] mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[26px] font-bold text-[#111111] mb-1.5">
            What Our Guests Say
          </h2>
          <p className="text-xs text-[#6b6b6b]">
            Real reviews from guests who&apos;ve experienced the Azure Oasis
            difference.
          </p>
        </div>
        <button className="flex items-center gap-1 text-xs text-[#111111] font-semibold hover:underline transition-all duration-200">
          See All Reviews
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Overall Rating */}
      <div className="flex items-center mb-6 select-none">
        <span className="text-[40px] font-extrabold text-[#111111] leading-none">
          4.9
        </span>
        <span className="text-lg text-[#999] ml-0.5 leading-none">/5</span>
        <div className="flex gap-0.5 items-center ml-2.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={15} className="text-[#f5a623] fill-[#f5a623]" />
          ))}
        </div>
        <span className="text-xs text-[#6b6b6b] ml-3">
          Based on 873 verified reviews
        </span>
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-4 gap-5">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-[12px] shadow-sm border border-[#eeeeee] p-4 flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Avatar & Name/Date in same column */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${review.gradient}`}
                >
                  {review.initials}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-[#111111] leading-tight">
                    {review.name}
                  </p>
                  <p className="text-[11px] text-[#999] mt-0.5 leading-none">
                    {review.date}
                  </p>
                </div>
              </div>

              {/* Stars Row */}
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={11}
                    className="text-[#f5a623] fill-[#f5a623]"
                  />
                ))}
              </div>

              {/* Room Pill */}
              <div className="mb-2">
                <span className="bg-[#f0f0f0] text-[#555555] text-[10px] rounded-full px-2.5 py-0.5 inline-flex items-center gap-1 font-medium">
                  <Crown size={10} className="text-[#555555]" />
                  Stayed in: {review.room}
                </span>
              </div>

              {/* Review Text */}
              <p className="text-[12px] text-[#555555] leading-relaxed line-clamp-4 mt-2">
                {review.review}
              </p>
            </div>

            {/* Helpful Row */}
            <div className="flex items-center gap-1 mt-3 text-[11px] text-[#999999] font-medium">
              <ThumbsUp size={12} />
              <span>{review.helpful} found this helpful</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
