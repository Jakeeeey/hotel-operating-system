"use client";

import { Star, Quote, ArrowRight } from "lucide-react";
import { reviews } from "../../data/data";

export function GuestReviews() {
  const displayReviews = reviews.slice(0, 3);
  const featuredReview = displayReviews[0];
  const sideReviews = displayReviews.slice(1, 3);

  return (
    <section className="w-full max-w-[1400px] mx-auto pt-4 md:pt-16 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

        {/* Column 1 — Header & CTA */}
        <div className="lg:col-span-4 flex flex-col items-start text-left lg:pr-4 lg:sticky lg:top-32">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[13px] font-semibold text-zinc-500 tracking-wider uppercase">
              Testimonials
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-[1.15] mb-5">
            What our guests{" "}
            <span className="font-serif italic font-normal text-zinc-800">
              say about us
            </span>
          </h2>

          <p className="text-[14px] text-zinc-400 font-light leading-relaxed max-w-[260px] mb-10">
            Real stories from real guests who have experienced our world-class hospitality.
          </p>

          {/* Aggregate rating summary */}
          <div className="flex flex-col gap-3 mb-10">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
              ))}
              <span className="text-sm font-semibold text-zinc-900 ml-2">4.9 / 5.0</span>
            </div>
            <p className="text-[12px] text-zinc-400 font-light">
              Based on 640+ verified stays
            </p>
          </div>

           <button className="flex items-center gap-4 bg-[#1c1c1e] text-white rounded-full pl-6 pr-2 py-2 hover:bg-black transition-all duration-300 hover:scale-105 active:scale-95 group">
            <span className="font-medium text-[15px]">View All</span>
            <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:translate-x-0.5">
              <ArrowRight size={18} strokeWidth={2.5} />
            </div>
          </button>
        </div>

        {/* Columns 2 & 3 — Review Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Featured Review — spans full width on md+ */}
          {featuredReview && (
            <div className="md:col-span-2 relative bg-zinc-900 rounded-3xl p-8 md:p-10 overflow-hidden hover:shadow-2xl hover:shadow-zinc-900/10 transition-all duration-500 group">
              {/* Decorative large quote mark */}
              <Quote
                size={80}
                className="absolute top-6 right-8 text-white/5 fill-white/5 group-hover:text-white/8 transition-colors duration-500"
              />

              {/* Stars */}
              <div className="flex gap-0.5 mb-6">
                {Array.from({ length: Math.floor(featuredReview.rating) }).map((_, s) => (
                  <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Review text — larger, italic emphasis on key phrase */}
              <p className="text-white text-[17px] md:text-xl font-light leading-relaxed mb-8 max-w-2xl relative z-10">
                &ldquo;{featuredReview.review.split(". ")[0]}.{" "}
                <span className="font-serif italic text-white/80">
                  {featuredReview.review.split(". ").slice(1).join(". ")}
                </span>&rdquo;
              </p>

              {/* Profile row */}
              <div className="flex items-center gap-4 relative z-10">
                <div
                  className={`w-10 h-10 rounded-full ${featuredReview.gradient} flex items-center justify-center shrink-0`}
                >
                  <span className="text-white text-xs font-bold">{featuredReview.initials}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{featuredReview.name}</p>
                  <p className="text-zinc-400 text-[12px] font-light">{featuredReview.room} · {featuredReview.date}</p>
                </div>
              </div>
            </div>
          )}

          {/* Side Review Cards */}
          {sideReviews.map((review) => (
            <div
              key={review.id}
              className="relative bg-white rounded-3xl border border-zinc-100 p-7 hover:border-zinc-200 hover:shadow-lg hover:shadow-zinc-100/80 transition-all duration-400 group overflow-hidden"
            >
              {/* Subtle decorative quote */}
              <Quote
                size={48}
                className="absolute top-4 right-5 text-zinc-100 fill-zinc-100 group-hover:text-zinc-200/60 transition-colors duration-300"
              />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: Math.floor(review.rating) }).map((_, s) => (
                  <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Review text */}
              <p className="text-[13px] text-zinc-500 leading-relaxed font-light mb-6 relative z-10">
                &ldquo;{review.review}&rdquo;
              </p>

              {/* Profile row */}
              <div className="flex items-center gap-3 relative z-10">
                <div
                  className={`w-8 h-8 rounded-full ${review.gradient} flex items-center justify-center shrink-0`}
                >
                  <span className="text-white text-[11px] font-bold">{review.initials}</span>
                </div>
                <div>
                  <p className="text-zinc-900 text-[13px] font-semibold">{review.name}</p>
                  <p className="text-zinc-400 text-[11px] font-light">{review.room} · {review.date}</p>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
