"use client";

import { BookingWidget } from "./BookingWidget";
import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="w-full px-2 sm:px-4 pt-[68px] pb-6 select-none bg-white">
      {/* ── Inner Banner Container ── */}
      <div className="relative w-full min-h-[90vh] md:h-[calc(100vh-100px)] rounded-[24px] md:rounded-2xl overflow-hidden flex flex-col justify-between p-0 sm:p-4">
        <Image
          fill
          priority
          unoptimized
          src="https://images.unsplash.com/photo-1680210851458-b7dc5685e06e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Luxury hotel room"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/60" />

        {/* Hero Title (Bottom Left, directly above BookingWidget) */}
        <div className="relative z-10 px-2 pb-4 md:pb-6 max-w-xl mt-auto">
          <h1 className="text-4xl sm:text-5xl md:text-[56px] text-white font-medium leading-[1.1] tracking-[-1.5px]">
            <span>Find Your Best Rooms</span>
          </h1>
        </div>

        {/* Booking Widget (Inner Bottom) */}
        <div className="relative z-10 w-full">
          <BookingWidget />
        </div>
      </div>
    </section>
  );
}
