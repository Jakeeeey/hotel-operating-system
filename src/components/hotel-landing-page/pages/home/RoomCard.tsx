"use client";

import { useState } from "react";
import { Heart, Star, Crown } from "lucide-react";
import { RoomData } from "../../types/types";
import Image from "next/image";

function formatPrice(price: number): string {
  return price >= 1000 ? `$${price.toLocaleString()}` : `$${price}`;
}

export function RoomCard({ room }: { room: RoomData }) {
  const [liked, setLiked] = useState<boolean>(false);

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full group select-none">
      {/* Image Area */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-zinc-100">
        <Image
          width={500}
          height={333}
          unoptimized
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />
        
        {/* Type Badge */}
        <span className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 z-10">
          {room.badge}
        </span>
        
        {/* Heart Favorite Button */}
        <button
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 hover:scale-105 transition-all duration-200 z-10"
          aria-label={liked ? "Unlike room" : "Like room"}
        >
          <Heart
            size={15}
            className={liked ? "fill-rose-500 text-rose-500" : "text-white"}
          />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Row 1: Name + Rating */}
          <div className="flex justify-between items-start gap-3">
            <span className="text-[15px] font-semibold text-zinc-900 line-clamp-1 flex-1 tracking-tight">
              {room.name}
            </span>
            <div className="flex items-center gap-1 shrink-0 mt-0.5 bg-zinc-50 border border-zinc-100 rounded-md px-1.5 py-0.5">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-[11px] text-zinc-900 font-bold leading-none">
                {room.rating.toFixed(1)}
              </span>
              <span className="text-[9px] text-zinc-400 leading-none">
                ({room.reviews})
              </span>
            </div>
          </div>

          {/* Row 2: Bed Info */}
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400 font-light">
            <Crown size={12} className="text-zinc-400 stroke-[1.5]" />
            <span>
              {room.bed} · {room.sqm}
            </span>
          </div>

          {/* Amenity Pills */}
          <div className="flex flex-wrap gap-1 mt-3">
            {room.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="bg-zinc-50 text-zinc-500 border border-zinc-100 text-[10px] rounded-md px-2 py-0.5 font-medium transition-colors hover:bg-zinc-100/50"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Area: Price & Action */}
        <div className="pt-4 border-t border-zinc-100 mt-5 flex justify-between items-center gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[17px] font-bold text-zinc-950 tracking-tight">
                {formatPrice(room.price)}
              </span>
              {room.originalPrice && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatPrice(room.originalPrice)}
                </span>
              )}
              <span className="text-[10px] text-zinc-400 font-normal">
                /night
              </span>
            </div>
            <p className="text-[9px] text-zinc-400 mt-0.5 leading-none">
              Includes taxes & fees
            </p>
          </div>
          
          <button className="bg-zinc-950 text-white rounded-full px-4 py-2 text-[11px] font-semibold hover:bg-black transition-all duration-200 shadow-sm flex items-center gap-1 group/btn">
            Book Now
            <span className="group-hover/btn:translate-x-0.5 transition-transform duration-200">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
