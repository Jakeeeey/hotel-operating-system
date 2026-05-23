"use client";

import { BookingWidget } from "./BookingWidget";
import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="relative w-full bg-[#111111]">
      {/* ── Container ── */}
      {/* Changed h-[28vh] to min-h-[28vh] md:h-screen so it can stretch safely if a device window is small */}
      <div className="relative w-full  min-h-[58vh] md:h-screen overflow-hidden flex flex-col justify-end">
        <Image
          width={100}
          height={100}
          unoptimized
          src="https://images.unsplash.com/photo-1680210851458-b7dc5685e06e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Luxury hotel room"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-black/70" />

        {/* Hero Title Container */}
        {/* Changed absolute positioning to relative on mobile so it doesn't get clipped by fixed heights */}
        <div className="relative md:absolute md:bottom-0 md:left-0 md:right-0 px-4 pb-6 md:pb-[240px] z-10">
          <h1 className="text-4xl sm:text-5xl md:text-[56px] text-white font-medium leading-[1.1] tracking-[-1.5px] max-w-xl">
            <span>Find Your Best Rooms</span>
          </h1>
        </div>
      </div>

      {/* ── Search Card Wrapper ── */}
      <div className="relative md:absolute w-full bottom-0 left-0 right-0 z-10 -mt-6 md:mt-0">
        <BookingWidget />
      </div>
    </section>
  );
}
