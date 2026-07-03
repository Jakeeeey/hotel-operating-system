"use client";

import { AmenityPostRow } from "./AmenityPostRow";
import { amenities } from "../../data/amenitiesData";

export function AmenitiesView() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 text-zinc-900 pb-20">
      
      {/* Editorial Magazine Header Section */}
      <div className="mb-12 pb-6 border-b border-zinc-200">
        <div className="space-y-1.5 text-left max-w-2xl">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block">
            Resort Inclusions & Services
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight text-zinc-950">
            Spaces designed for <span className="italic font-light text-zinc-600">absolute elevation</span>
          </h1>
        </div>
      </div>

      {/* Sequential Long-form Editorial Feed */}
      <div className="space-y-4 divide-y divide-zinc-100 animate-fade-in">
        {amenities.map((amenity, index) => (
          <AmenityPostRow 
            key={amenity.id}
            amenity={amenity}
            index={index}
          />
        ))}
      </div>

    </div>
  );
}