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
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase">
           Testimonials
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif tracking-tight text-zinc-900 leading-[1.15] mb-5 font-normal">
            What our guests{" "}
            <span className="italic font-light text-zinc-500">
              say about us
            </span>
          </h2>

          <p className="text-[13px] text-zinc-400 font-sans tracking-wide leading-relaxed max-w-[280px] mb-8">
            Real stories from real guests who have experienced our world-class hospitality matrix.
          </p>

          {/* Aggregate rating summary */}
          <div className="flex flex-col gap-1.5 mb-8 border-l-2 border-zinc-950 pl-4 py-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-zinc-950 font-sans tracking-tight">4.9 / 5.0 Rating</span>
            </div>
            <p className="text-[11px] text-zinc-400 tracking-wide font-sans">
              Based on 640+ verified premium stays
            </p>
          </div>

          {/* View All Button — Left completely untouched per request */}
          <button className="flex items-center gap-4 bg-[#1c1c1e] text-white rounded-full pl-6 pr-2 py-2 hover:bg-black transition-all duration-300 hover:scale-105 active:scale-95 group">
            <span className="font-medium text-[15px]">View All</span>
            <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:translate-x-0.5">
              <ArrowRight size={18} strokeWidth={2.5} />
            </div>
          </button>
        </div>

        {/* Columns 2 & 3 — Review Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Featured Review — Spans full width on layout viewports */}
          {featuredReview && (
            <div className="md:col-span-2 rounded-2xl relative bg-zinc-950 p-8 md:p-10 overflow-hidden group border border-zinc-950">
              {/* Decorative premium large quote mark */}
              <Quote
                size={90}
                className="absolute -top-2 right-4 text-white/[0.03] fill-white/[0.03] group-hover:text-white/[0.05] transition-colors duration-500 pointer-events-none"
              />

              {/* Minimal Text Metric Label instead of loose icon rows */}
              <div className="text-[10px] font-bold tracking-[0.15em] text-amber-400 uppercase font-sans mb-6 bg-white/5 border border-white/10 px-2 py-0.5 w-fit rounded-sm">
                ★ {featuredReview.rating.toFixed(1)} Score
              </div>

              {/* Review text — large serif style layout */}
              <p className="text-white text-lg md:text-xl font-light leading-relaxed mb-8 max-w-2xl relative z-10 font-sans">
                &ldquo;{featuredReview.review.split(". ")[0]}.{" "}
                <span className="font-serif italic text-zinc-400">
                  {featuredReview.review.split(". ").slice(1).join(". ")}
                </span>&rdquo;
              </p>

              {/* Profile row */}
              <div className="flex items-center gap-4 border-t border-white/10 pt-6 relative z-10">
                <div className="w-9 h-9 rounded-sm bg-white/10 border border-white/10 text-white flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold tracking-wider font-sans">{featuredReview.initials}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-serif font-medium">{featuredReview.name}</p>
                  <p className="text-zinc-500 text-[11px] font-sans tracking-wide mt-0.5">{featuredReview.room} <span className="text-zinc-700 px-1">|</span> {featuredReview.date}</p>
                </div>
              </div>
            </div>
          )}

          {/* Side Review Cards */}
          {sideReviews.map((review) => (
            <div
              key={review.id}
              className="relative bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 hover:border-zinc-400 transition-colors duration-200 group overflow-hidden flex flex-col justify-between"
            >
              <div className="relative z-10">
                {/* Micro-score bar */}
                <div className="text-[10px] font-bold tracking-[0.15em] text-zinc-800 uppercase font-sans mb-4 bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 w-fit rounded-sm">
                  ★ {review.rating.toFixed(1)} Score
                </div>

                {/* Review text */}
                <p className="text-[13px] text-zinc-600 leading-relaxed font-sans mb-8 font-normal">
                  &ldquo;{review.review}&rdquo;
                </p>
              </div>

              {/* Profile row adjusted structurally at the bottom border row */}
              <div className="flex items-center gap-3 border-t border-zinc-100 pt-5 relative z-10">
                <div className="w-8 h-8 rounded-sm bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center shrink-0">
                  <span className="text-zinc-800 text-[10px] font-bold font-sans">{review.initials}</span>
                </div>
                <div>
                  <p className="text-zinc-900 text-[13px] font-serif font-medium">{review.name}</p>
                  <p className="text-zinc-400 text-[11px] font-sans tracking-wide mt-0.5">{review.room} <span className="text-zinc-200 px-0.5">|</span> {review.date}</p>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}