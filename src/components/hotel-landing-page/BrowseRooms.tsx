"use client";

import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { rooms } from "./data";
import { RoomCard } from "./RoomCard";

export function BrowseRooms() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const filterTabs = [
    "All",
    "Deluxe Room",
    "Suite",
    "Pool Villa",
    "Ocean View",
    "Overwater Bungalow",
  ];

  const filterMap: Record<string, string[]> = {
    All: [],
    "Deluxe Room": ["deluxe"],
    Suite: ["suite"],
    "Pool Villa": ["villa"],
    "Ocean View": ["deluxe", "suite"],
    "Overwater Bungalow": ["overwater"],
  };

  const filteredRooms =
    activeFilter === "All"
      ? rooms
      : rooms.filter((r) => filterMap[activeFilter]?.includes(r.type));

  return (
    <section className="max-w-[1400px] mx-auto py-4 px-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[26px] font-bold text-[#111111] mb-1.5">
            Browse Our Rooms
          </h2>
          <p className="text-xs text-[#6b6b6b]">
            Choose from our curated selection of rooms and villas for your
            perfect stay.
          </p>
        </div>
        <button className="flex items-center gap-1 text-xs text-[#111111] font-semibold hover:underline transition-all duration-200">
          See All Rooms
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 ${
              activeFilter === tab
                ? "bg-[#111111] text-white"
                : "bg-[#f0f0f0] text-[#555555] hover:bg-[#dddddd]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Room Grid + Chevron */}
      <div className="relative flex items-center">
        <div className="grid grid-cols-4 gap-5 flex-1">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
        {/* Chevron hint */}
        <button className="absolute right-[-18px] z-20 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 transition-transform duration-200">
          <ChevronRight size={16} className="text-[#111111]" />
        </button>
      </div>
    </section>
  );
}
