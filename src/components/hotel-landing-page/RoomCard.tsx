"use client"

import { useState } from "react"
import { Heart, Star, Crown } from "lucide-react"
import { RoomData } from "./types"

function formatPrice(price: number): string {
  return price >= 1000 ? `$${price.toLocaleString()}` : `$${price}`
}

function getAvailabilityClasses(availability: RoomData["availability"]): string {
  switch (availability) {
    case "available":
      return "bg-[#e6f4ea] text-[#2d7a3a]"
    case "low":
      return "bg-[#fff3cd] text-[#856404]"
    case "critical":
      return "bg-[#fde8e8] text-[#b91c1c]"
  }
}

function getAvailabilityText(availability: RoomData["availability"]): string {
  switch (availability) {
    case "available":
      return "Available"
    case "low":
      return "2+ rooms left"
    case "critical":
      return "1 room left"
  }
}

export function RoomCard({ room }: { room: RoomData }){
  const [liked, setLiked] = useState(false)

  return (
    <div className="bg-white rounded-[12px] shadow-sm border border-[#eeeeee] overflow-hidden hover:-translate-y-[3px] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between">
      <div>
        {/* Image Area */}
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          <img
            src={room.image}
            alt={room.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {/* Type Badge */}
          <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] rounded-[4px] px-2 py-0.5 z-10">
            {room.badge}
          </span>
          {/* Heart */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLiked(!liked)
            }}
            className="absolute top-2 right-2 transition-colors duration-200 z-10"
            aria-label={liked ? "Unlike room" : "Like room"}
          >
            <Heart
              size={18}
              className={liked ? "fill-red-500 text-red-500" : "text-white"}
            />
          </button>
          {/* Availability Badge */}
          <span
            className={`absolute bottom-2 left-2 text-[10px] rounded-[4px] px-2 py-0.5 font-medium z-10 ${getAvailabilityClasses(
              room.availability
            )}`}
          >
            {getAvailabilityText(room.availability)}
          </span>
        </div>

        {/* Content Area */}
        <div className="p-3">
          {/* Row 1: Name + Rating */}
          <div className="flex justify-between items-start gap-2">
            <span className="text-sm font-semibold text-[#111111] line-clamp-1 flex-1">{room.name}</span>
            <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
              <Star size={11} className="text-[#f5a623] fill-[#f5a623]" />
              <span className="text-xs text-[#111111] font-semibold">{room.rating}</span>
              <span className="text-[10px] text-[#6b6b6b]">({room.reviews})</span>
            </div>
          </div>

          {/* Row 2: Bed Info */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#6b6b6b]">
            <Crown size={12} className="text-[#6b6b6b]" />
            <span>
              {room.bed} · {room.sqm}
            </span>
          </div>

          {/* Amenity Pills */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {room.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="bg-[#f0f0f0] text-[#555555] text-[10px] rounded-full px-2 py-0.5 font-medium"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Area: Price & Action */}
      <div className="p-3 pt-0 border-t border-[#fcfcfc] mt-auto">
        <div className="flex justify-between items-end gap-2 mt-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-[#111111]">
                {formatPrice(room.price)}
              </span>
              {room.originalPrice && (
                <span className="text-xs text-[#aaaaaa] line-through">
                  {formatPrice(room.originalPrice)}
                </span>
              )}
              <span className="text-[10px] text-[#999999] font-medium">/night</span>
            </div>
            <p className="text-[10px] text-[#999999] leading-none mt-1">Includes taxes & fees</p>
          </div>
          <button className="bg-[#111111] text-white rounded-[8px] px-3 py-1.5 text-[11px] font-medium hover:bg-[#333333] transition-colors duration-200 shrink-0">
            Book Now →
          </button>
        </div>
      </div>
    </div>
  )
}
