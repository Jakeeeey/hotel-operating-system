"use client";

import { Banknote, Building2, Zap, Clock } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    { icon: <Banknote size={24} strokeWidth={1.5} />, label: "Best Price", desc: "Get guaranteed transparent pricing with no hidden fees." },
    { icon: <Building2 size={24} strokeWidth={1.5} />, label: "Complete Selection", desc: "Find the hotel that suits your needs, from budget-friendly to luxury." },
    { icon: <Zap size={24} strokeWidth={1.5} />, label: "Easy Booking", desc: "Book a room in just minutes with a fast and hassle-free system." },
    { icon: <Clock size={24} strokeWidth={1.5} />, label: "24/7 Support", desc: "Our customer service team is ready to help you anytime, anywhere." },
  ];

  return (
    <section className="w-full max-w-[1400px] mx-auto py-16 md:py-24 px-4 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start w-full">

        {/* Left Column — Title, Paragraph & Stats */}
        <div className="lg:col-span-5 flex flex-col h-full justify-between pr-0 lg:pr-8">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Main Title */}
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-[1.15] mb-5">
              Why Choose <span className="font-serif italic font-normal">Us</span>
            </h2>

            {/* Description Paragraph */}
            <p className="text-zinc-500 text-[15px] leading-relaxed max-w-sm">
              We are here to make your travel easier, more comfortable, and worry-free.
            </p>
          </div>

          {/* Stats Segment */}
          <div className="flex items-center justify-center lg:justify-start gap-10 mt-12 lg:mt-24 pt-4 border-t border-zinc-100">
            <div className="flex flex-col items-center lg:items-start">
              <div className="text-4xl md:text-5xl font-light tracking-tight text-black mb-1">
                1000+
              </div>
              <div className="text-[13px] text-zinc-400 font-normal">
                Experienced People
              </div>
            </div>

            <div className="h-12 w-[1px] bg-zinc-200" />

            <div className="flex flex-col items-center lg:items-start">
              <div className="text-4xl md:text-5xl font-light tracking-tight text-black mb-1">
                700+
              </div>
              <div className="text-[13px] text-zinc-400 font-normal">
                Hotels in Indonesia
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — 2x2 Feature Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-2 border-collapse mt-4 lg:mt-0">
          {features.map((feature, idx) => {
            // Border classes: right border on left-column items, bottom border on top-row items
            const isLeftCol = idx % 2 === 0;
            const isTopRow = idx < 2;
            const borderClass = [
              isLeftCol ? "border-r" : "",
              isTopRow ? "border-b" : "",
              "border-zinc-100/80",
            ].join(" ");

            return (
              <div key={feature.label} className={`p-4 md:p-8 flex flex-col gap-3 ${borderClass}`}>
                {/* Icon — centered on mobile, left on desktop */}
                <div className="w-10 h-10 flex items-center justify-center lg:justify-start text-black">
                  {feature.icon}
                </div>
                {/* Title — centered on mobile */}
                <h3 className="text-[14px] md:text-[17px] font-medium text-black tracking-tight lg:text-left">
                  {feature.label}
                </h3>
                {/* Description — hidden on mobile, visible on md+ */}
                <p className="hidden md:block text-[13.5px] text-zinc-400 leading-relaxed font-light">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
