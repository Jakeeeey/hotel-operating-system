"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { RoomCard } from "./RoomCard";
import { useRooms } from "./hooks/useRooms";

export function BrowseRooms() {
  const { rooms, loading } = useRooms();
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  // Keep your existing filters
  const filterTabs = ["All", "Deluxe Room", "Suite", "Pool Villa", "Ocean View", "Overwater Bungalow"];

  const filteredRooms = activeFilter === "All"
    ? rooms
    : rooms.filter((r) => r.type === activeFilter.toLowerCase()); // Ensure your DB/Service returns lowercase types

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [filteredRooms]);

  if (loading) return <div className="py-24 text-center">Loading Rooms...</div>;

  return (
    <section className="max-w-[1400px] mx-auto py-16 md:py-24 px-4 select-none">
      {/* Header and Filter sections remain unchanged to preserve your design */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <span className="text-[13px] font-semibold text-zinc-500 tracking-wider uppercase">Accommodation</span>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-[1.15] mb-2.5">
            Browse Our <span className="font-serif italic font-normal text-zinc-800">Rooms</span>
          </h2>
        </div>
      </div>

      <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => (
          <button key={tab} onClick={() => setActiveFilter(tab)} 
            className={`rounded-sm px-4 py-2 text-[11px] font-bold uppercase ${activeFilter === tab ? "bg-zinc-950 text-white" : "bg-white text-zinc-500 border"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="relative group/carousel">
        <div ref={scrollRef} onScroll={checkScroll} className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none pb-4 w-full">
          {filteredRooms.map((room) => (
            <div key={room.id} className="w-[290px] sm:w-[340px] md:w-[360px] shrink-0 snap-start">
              <RoomCard room={room} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
// "use client";

// import { useState, useRef, useEffect } from "react";
// import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
// import { rooms } from "../../data/data";
// import { RoomCard } from "./RoomCard";

// export function BrowseRooms() {
//   const [activeFilter, setActiveFilter] = useState<string>("All");
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
//   const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

//   const filterTabs = [
//     "All",
//     "Deluxe Room",
//     "Suite",
//     "Pool Villa",
//     "Ocean View",
//     "Overwater Bungalow",
//   ];

//   const filterMap: Record<string, string[]> = {
//     All: [],
//     "Deluxe Room": ["deluxe"],
//     Suite: ["suite"],
//     "Pool Villa": ["villa"],
//     "Ocean View": ["deluxe", "suite"],
//     "Overwater Bungalow": ["overwater"],
//   };

//   const filteredRooms =
//     activeFilter === "All"
//       ? rooms
//       : rooms.filter((r) => filterMap[activeFilter]?.includes(r.type));

//   // Check scroll position to dynamically show/hide buttons
//   const checkScroll = () => {
//     if (scrollRef.current) {
//       const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
//       setCanScrollLeft(scrollLeft > 10);
//       setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
//     }
//   };

//   useEffect(() => {
//     checkScroll();
//     window.addEventListener("resize", checkScroll);
//     return () => window.removeEventListener("resize", checkScroll);
//   }, [filteredRooms]);

//   const handleScroll = (direction: "left" | "right") => {
//     if (scrollRef.current) {
//       const { clientWidth } = scrollRef.current;
//       const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
//       scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
//     }
//   };

//   return (
//     <section className="max-w-[1400px] mx-auto py-16 md:py-24 px-4 select-none">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
//         <div>
//           {/* Tagline Indicator */}
//           <div className="flex items-center gap-2 mb-3">
//             <span className="text-[13px] font-semibold text-zinc-500 tracking-wider uppercase">
//               Accommodation
//             </span>
//           </div>
//           <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-[1.15] mb-2.5">
//             Browse Our <span className="font-serif italic font-normal text-zinc-800">Rooms</span>
//           </h2>
//           <p className="text-[14px] text-zinc-400 font-light max-w-xl">
//             Choose from our curated selection of rooms and villas for your perfect stay.
//           </p>
//         </div>
//         <button className="flex items-center gap-1.5 bg-zinc-950 text-white text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-black transition-all duration-200 group shrink-0 shadow-sm">
//           See All Rooms
//           <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
//         </button>
//       </div>

//  {/* Filter Tabs — Clean Editorial Style */}
//       <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
//         {filterTabs.map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveFilter(tab)}
//             className={`rounded-sm px-4 py-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all shrink-0 select-none border ${
//               activeFilter === tab
//                 ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
//                 : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Room Carousel Container */}
//       <div className="relative group/carousel">
        
//         {/* Left Arrow Button — Minimal Box Interface */}
//         {canScrollLeft && (
//           <button
//             onClick={() => handleScroll("left")}
//             className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-sm shadow-md border border-zinc-200 items-center justify-center hover:bg-white hover:border-zinc-400 active:scale-[0.98] transition-all cursor-pointer"
//             aria-label="Scroll left"
//           >
//             <ChevronLeft size={16} className="text-zinc-800" strokeWidth={2.5} />
//           </button>
//         )}

//         {/* Right Arrow Button — Minimal Box Interface */}
//         {canScrollRight && (
//           <button
//             onClick={() => handleScroll("right")}
//             className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-sm shadow-md border border-zinc-200 items-center justify-center hover:bg-white hover:border-zinc-400 active:scale-[0.98] transition-all cursor-pointer"
//             aria-label="Scroll right"
//           >
//             <ChevronRight size={16} className="text-zinc-800" strokeWidth={2.5} />
//           </button>
//         )}

//         {/* Scrollable Track */}
//         <div
//           ref={scrollRef}
//           onScroll={checkScroll}
//           className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none pb-4 pt-1 w-full px-4 md:mx-0 md:px-0"
//         >
//           {filteredRooms.map((room) => (
//             <div
//               key={room.id}
//               className="w-[290px] sm:w-[340px] md:w-[360px] shrink-0 snap-start"
//             >
//               <RoomCard room={room} />
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
