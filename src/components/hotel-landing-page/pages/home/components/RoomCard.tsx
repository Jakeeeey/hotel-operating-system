"use client";

import { Suspense, useState } from "react";
import { Heart, Star, Crown } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { RoomData } from "../types/room.types";

function formatPrice(price: number): string {
  return price >= 1000 ? `₱${price.toLocaleString()}` : `₱${price}`;
}

function RoomCardInner({ room }: { room: RoomData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [liked, setLiked] = useState<boolean>(false);

  return (
    <div className="bg-white border border-zinc-200/80 rounded-sm overflow-hidden hover:border-zinc-400 transition-all duration-300 flex flex-col h-full group select-none">
      
      {/* Media Frame Layer */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
        <Image
          width={500}
          height={333}
          unoptimized
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out grayscale-[15%] group-hover:grayscale-0"
        />
        
        {/* Type Identifier Tag */}
        <span className="absolute top-3 left-3 bg-zinc-950 text-white text-[9px] font-bold uppercase tracking-[0.15em] rounded-sm px-2.5 py-1 z-10 shadow-xs">
          {room.badge}
        </span>
        
        {/* Heart Layer Control Link */}
        <button
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-sm bg-white/80 backdrop-blur-md flex items-center justify-center text-zinc-900 border border-zinc-200/40 hover:bg-white hover:scale-102 transition-all duration-150 z-10 shadow-xs"
          aria-label={liked ? "Unlike room" : "Like room"}
        >
          <Heart
            size={13}
            className={liked ? "fill-red-500 text-red-500" : "text-zinc-600 group-hover:text-zinc-950"}
          />
        </button>
      </div>

      {/* Structured Copy Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Typography + Matrix Metrics */}
          <div className="flex justify-between items-start gap-4">
            <span className="font-serif text-base text-zinc-900 line-clamp-1 flex-1 font-medium tracking-tight group-hover:text-zinc-600 transition-colors">
              {room.name}
            </span>
            <div className="flex items-center gap-1 shrink-0 bg-zinc-50 border border-zinc-100 rounded-sm px-1.5 py-0.5">
              <Star size={10} className="text-zinc-400 fill-zinc-400" />
              <span className="text-[11px] text-zinc-800 font-bold font-sans">
                {room.rating.toFixed(1)}
              </span>
              <span className="text-[9px] text-zinc-400 font-sans font-normal">
                ({room.reviews})
              </span>
            </div>
          </div>

          {/* Core Configuration Specs Row */}
          <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-400 font-sans tracking-wide">
            <Crown size={12} className="text-zinc-300 stroke-[2]" />
            <span>
              {room.bed} <span className="text-zinc-200 px-0.5">|</span> {room.maxAdults} Adults, {room.maxChildren} Children
            </span>
          </div>

          {/* Contextual Amenity Tags Layout Array */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {room.amenities.slice(0, 3).map((amenity: string) => (
              <span
                key={amenity}
                className="bg-zinc-50/50 text-zinc-500 border border-zinc-200/60 text-[9px] font-bold uppercase tracking-wider rounded-sm px-2 py-0.5"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Ledger Pricing & Submit Action Block */}
        <div className="pt-4 border-t border-zinc-100 mt-5 flex justify-between items-end gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-zinc-950 tracking-tight font-sans">
                {formatPrice(room.price)}
              </span>
              {room.originalPrice && (
                <span className="text-xs text-zinc-400 line-through font-sans font-light">
                  {formatPrice(room.originalPrice)}
                </span>
              )}
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 ml-0.5">
                / Night
              </span>
            </div>
            <p className="text-[9px] text-zinc-400 mt-1 tracking-normal font-sans">
              Gross inclusive matrix
            </p>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const paramsString = searchParams ? `?${searchParams.toString()}` : "";
              router.push(`/hotel-landing-page/rooms/${room.id}${paramsString}`);
            }}
            className="bg-zinc-950 text-white rounded-sm px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-black transition-all duration-150 shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Reserve</span>
            <span className="text-[11px] font-normal font-sans opacity-70 transform group-hover:translate-x-0.5 transition-transform duration-150">→</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export function RoomCard({ room }: { room: RoomData }) {
  return (
    <Suspense fallback={<div className="bg-white border border-zinc-200/80 rounded-sm h-full min-h-[300px] animate-pulse"></div>}>
      <RoomCardInner room={room} />
    </Suspense>
  );
}