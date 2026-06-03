"use client";

import { Suspense, useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  User, 
  ChevronDown, 
  ArrowRight, 
  Minus, 
  Plus, 
  Tag, 
  Check 
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const VARIANT_PALETTE = ["zinc", "amber", "dark", "emerald", "blue"] as const;

interface BookingWidgetProps {
  dynamicBadges?: Array<string | { badge?: string }>;
}

function BookingWidgetInner({ dynamicBadges = [] }: BookingWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomBadges = useMemo(() => {
    const baseOption = { id: "all", label: "All Rooms", variant: "zinc" };
    
    if (!Array.isArray(dynamicBadges)) return [baseOption];

    const fetchedOptions = dynamicBadges
      .map((item) => {
        const badgeName = typeof item === "string" ? item : item?.badge;
        if (!badgeName || typeof badgeName !== "string") return null;
        return badgeName;
      })
      .filter((b): b is string => b !== null);

    // Deduplicate
    const uniqueBadges = [...new Set(fetchedOptions)];

    const options = uniqueBadges.map((badge, index) => ({
      id: badge,
      label: `${badge}`,
      variant: VARIANT_PALETTE[index % VARIANT_PALETTE.length],
    }));

    return [baseOption, ...options];
  }, [dynamicBadges]);

  // Initialize states from URL if they exist to keep the UI synchronized
  const [checkin, setCheckin] = useState<Date | undefined>(
    searchParams.get("checkin") ? new Date(searchParams.get("checkin")!) : undefined
  );
  const [checkout, setCheckout] = useState<Date | undefined>(
    searchParams.get("checkout") ? new Date(searchParams.get("checkout")!) : undefined
  );
  const [adults, setAdults] = useState(Number(searchParams.get("adults")) || 2);
  const [children, setChildren] = useState(Number(searchParams.get("children")) || 0);
  const [selectedBadge, setSelectedBadge] = useState(searchParams.get("badge") || "all");

  const handleSearch = () => {
    const params = new URLSearchParams();

    const formatDateForUrl = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (checkin) params.set("checkin", formatDateForUrl(checkin));
    if (checkout) params.set("checkout", formatDateForUrl(checkout));
    params.set("adults", adults.toString());
    params.set("children", children.toString());
    
    if (selectedBadge !== "all") {
      params.set("badge", selectedBadge);
    }

    router.push(`/hotel-landing-page/rooms?${params.toString()}`);
  };

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return "Add date";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const currentBadgeLabel = roomBadges.find((b) => b.id === selectedBadge)?.label || "All Rooms";

  return (
    <div className="w-full mx-auto p-0 select-none">
      <div className="bg-white rounded-xl p-5 md:p-6 shadow-xl shadow-zinc-950/5 relative border border-zinc-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative">
          
          {/* Check-in */}
          <div className="flex flex-col gap-1.5 col-span-1 relative">
            <label className="text-[9px] font-bold tracking-[0.15em] text-zinc-400 uppercase font-sans">
              Check-in
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50/80 border border-zinc-200/80 transition-colors rounded-sm px-3 md:px-4 py-3 cursor-pointer group">
                  <div className="flex items-center gap-2 min-w-0">
                    <CalendarIcon size={14} className="text-zinc-400 shrink-0 group-hover:text-zinc-600 transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-sans truncate">
                      {formatDisplayDate(checkin)}
                    </span>
                  </div>
                  <ChevronDown size={13} className="text-zinc-400 shrink-0 transition-transform group-hover:translate-y-px" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkin}
                  onSelect={setCheckin}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out */}
          <div className="flex flex-col gap-1.5 col-span-1 relative">
            <label className="text-[9px] font-bold tracking-[0.15em] text-zinc-400 uppercase font-sans">
              Check-out
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50/80 border border-zinc-200/80 transition-colors rounded-sm px-3 md:px-4 py-3 cursor-pointer group">
                  <div className="flex items-center gap-2 min-w-0">
                    <CalendarIcon size={14} className="text-zinc-400 shrink-0 group-hover:text-zinc-600 transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-sans truncate">
                      {formatDisplayDate(checkout)}
                    </span>
                  </div>
                  <ChevronDown size={13} className="text-zinc-400 shrink-0 transition-transform group-hover:translate-y-px" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkout}
                  onSelect={setCheckout}
                  disabled={(date) => checkin ? date <= checkin : date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Occupancy */}
          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1 relative">
            <label className="text-[9px] font-bold tracking-[0.15em] text-zinc-400 uppercase font-sans">
              Occupancy
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50/80 border border-zinc-200/80 transition-colors rounded-sm px-3 md:px-4 py-3 cursor-pointer group">
                  <div className="flex items-center gap-2 min-w-0">
                    <User size={14} className="text-zinc-400 shrink-0 group-hover:text-zinc-600 transition-colors" />
                    <span className="text-xs font-bold tracking-tight text-zinc-900 font-sans truncate">
                      {adults} {adults === 1 ? "Adult" : "Adults"} <span className="text-zinc-300 font-light px-1">/</span> {children} {children === 1 ? "Child" : "Children"}
                    </span>
                  </div>
                  <ChevronDown size={13} className="text-zinc-400 shrink-0 transition-transform group-hover:translate-y-px" />
                </div>
              </PopoverTrigger>

              <PopoverContent className="w-72 p-4 bg-white shadow-xl shadow-zinc-950/10 border-zinc-200" align="start" sideOffset={8}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900 tracking-tight">Adults</span>
                      <span className="text-[10px] text-zinc-400 font-medium">Ages 13 or above</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors disabled:opacity-30 disabled:hover:border-zinc-200"
                        disabled={adults <= 1}
                      >
                        <Minus size={11} strokeWidth={2.5} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-zinc-900">{adults}</span>
                      <button 
                        onClick={() => setAdults(Math.min(10, adults + 1))}
                        className="w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                      >
                        <Plus size={11} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900 tracking-tight">Children</span>
                      <span className="text-[10px] text-zinc-400 font-medium">Ages 0-12</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors disabled:opacity-30 disabled:hover:border-zinc-200"
                        disabled={children <= 0}
                      >
                        <Minus size={11} strokeWidth={2.5} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-zinc-900">{children}</span>
                      <button 
                        onClick={() => setChildren(Math.min(10, children + 1))}
                        className="w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                      >
                        <Plus size={11} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Collection / Badge Filter Dropdown */}
          <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
            <label className="text-[9px] font-bold tracking-[0.15em] text-zinc-400 uppercase font-sans">
              Collection
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50/80 border border-zinc-200/80 transition-colors rounded-sm px-3 md:px-4 py-3 cursor-pointer group">
                  <div className="flex items-center gap-2 min-w-0">
                    <Tag size={14} className="text-zinc-400 shrink-0 group-hover:text-zinc-600 transition-colors" />
                    <span className="text-xs font-bold text-zinc-900 font-sans truncate">
                      {currentBadgeLabel}
                    </span>
                  </div>
                  <ChevronDown size={13} className="text-zinc-400 shrink-0 transition-transform group-hover:translate-y-px" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[220px] p-1.5 bg-white shadow-xl shadow-zinc-950/10 border-zinc-200" align="start" sideOffset={8}>
                <div className="flex flex-col gap-0.5">
                  {roomBadges.map((item) => {
                    const isSelected = selectedBadge === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedBadge(item.id)}
                        className={`flex items-center justify-between text-xs font-semibold text-left px-3 py-2.5 rounded-xs transition-colors cursor-pointer w-full group ${
                          isSelected 
                            ? "bg-zinc-950 text-white" 
                            : "text-zinc-800 hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isSelected && <Check size={12} strokeWidth={3} className="shrink-0" />}
                          <span className={`truncate ${!isSelected && "group-hover:translate-x-0.5 transition-transform"}`}>
                            {item.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end mt-5 md:mt-6">
          <button 
            onClick={handleSearch}
            className="w-full md:w-auto min-w-[180px] bg-zinc-950 text-white rounded-sm px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-150 hover:bg-black flex items-center justify-center gap-2 shadow-xs cursor-pointer group/btn"
          >
            <span>Check Availability</span>
            <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function BookingWidget(props: BookingWidgetProps) {
  return (
    <Suspense fallback={<div className="w-full mx-auto p-0 min-h-[120px] bg-white rounded-xl shadow-xl shadow-zinc-950/5 relative border border-zinc-100 flex items-center justify-center"><span className="text-sm text-zinc-400">Loading...</span></div>}>
      <BookingWidgetInner {...props} />
    </Suspense>
  );
}