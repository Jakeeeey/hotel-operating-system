"use client";

import { X, Clock, MapPin, CheckCircle2, ShieldAlert } from "lucide-react";
import { AmenityData } from "../../types/types";

interface AmenityDetailModalProps {
  amenity: AmenityData | null;
  onClose: () => void;
}

export function AmenityDetailModal({ amenity, onClose }: AmenityDetailModalProps) {
  if (!amenity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in">
      {/* Click outside target element */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide Out Panel Surface */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col justify-between text-zinc-900 overflow-y-auto z-10 animate-slide-left">
        
        {/* Top Sticky Dismiss Bar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 h-8 w-8 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        <div>
          {/* Header Visual Deck */}
          <div className="relative w-full aspect-[16/10] bg-zinc-100 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={amenity.heroImage} alt={amenity.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-black/20 to-black/40" />
            
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 space-y-1">
              <span className="inline-block text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 bg-zinc-950 text-white rounded-none">
                {amenity.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-normal text-zinc-950 tracking-tight">
                {amenity.title}
              </h2>
            </div>
          </div>

          {/* Detailed Specifications Content Stack */}
          <div className="p-6 md:p-8 space-y-6">
            <p className="text-zinc-500 font-light leading-relaxed text-sm tracking-wide">
              {amenity.description}
            </p>

            {/* Logistics Grid Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-50 border border-zinc-200 p-4 font-medium text-xs text-zinc-700">
              <div className="flex items-center gap-2.5">
                <Clock size={14} className="text-zinc-400" />
                <span>Hours: {amenity.hoursOfOperation}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-zinc-400" />
                <span>Location: {amenity.locationDetails}</span>
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950">Space Highlights</h4>
              <div className="grid grid-cols-1 gap-2.5">
                {amenity.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-600 font-light">
                    <CheckCircle2 size={13} className="text-zinc-950 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operational Policies Section */}
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-500" /> Ground Regulations & Etiquette
              </h4>
              <ul className="space-y-2 list-none pl-0 text-xs text-zinc-400 font-light tracking-wide">
                {amenity.guidelines.map((policy, idx) => (
                  <li key={idx} className="flex gap-2 items-baseline">
                    <span className="text-zinc-950 font-bold select-none">·</span>
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Confirmation Bar */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Access Protocol</span>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-zinc-950 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}