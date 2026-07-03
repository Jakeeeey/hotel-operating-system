import Link from "next/link";
import { Plus, X, CreditCard } from "lucide-react";
import { RoomData } from "../../home/types/room.types";

interface BookingSummaryCardProps {
  matchedRooms: RoomData[];
  handleRemoveRoom: (id: number) => void;
  roomIdsRaw: string;
  checkinStr: string;
  checkoutStr: string;
  adultsCount: number;
  childrenCount: number;
  formatDisplayDate: (dateStr: string) => string;
  searchParamsStr: string;
  totalNights: number;
  baseSubtotal: number;
  totalInvoiceGross: number;
  isSubmitting: boolean;
}

export function BookingSummaryCard({
  matchedRooms,
  handleRemoveRoom,
  roomIdsRaw,
  checkinStr,
  checkoutStr,
  adultsCount,
  childrenCount,
  formatDisplayDate,
  searchParamsStr,
  totalNights,
  baseSubtotal,
  totalInvoiceGross,
  isSubmitting,
}: BookingSummaryCardProps) {
  return (
    <div className="lg:col-span-5 space-y-6">
      <div className="border border-zinc-200 bg-white rounded-sm p-6 space-y-6">
        <div className="border-b border-zinc-100 pb-4 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">Stay Summary Matrix</h3>
          <span className="border border-zinc-200 text-zinc-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm flex items-center gap-1">
            {matchedRooms.length} {matchedRooms.length === 1 ? "Space" : "Spaces"}
          </span>
        </div>
        
        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 divide-y divide-zinc-50">
          {matchedRooms.map((room, idx) => (
            <div key={room.id} className={`flex gap-4 items-center group/room ${idx > 0 ? 'pt-3' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={room.image} alt={room.name} className="w-16 aspect-[4/3] rounded-sm object-cover shrink-0 grayscale-[20%] border border-zinc-100" />
              <div className="min-w-0 flex-grow">
                <h4 className="font-serif text-sm text-zinc-900 truncate font-medium">{room.name}</h4>
                <span className="text-[10px] text-zinc-400 tracking-wide block mt-0.5">{room.bed}</span>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2.5">
                <span className="text-xs font-bold text-zinc-900">₱{room.price.toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRoom(room.id)}
                  className="p-1 text-zinc-300 hover:text-red-600 hover:bg-zinc-50 rounded-sm transition-colors cursor-pointer"
                  title="Remove from booking"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Link 
          href={`/hotel-landing-page/rooms?roomIds=${roomIdsRaw}&checkin=${checkinStr}&checkout=${checkoutStr}&adults=${adultsCount}&children=${childrenCount}`}
          className="w-full py-2.5 border border-dashed border-zinc-300 hover:border-zinc-900 text-zinc-800 rounded-sm text-[10px] font-bold uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={12} className="text-zinc-500" />
          Add Rooms to Booking
        </Link>

        <div className="relative group/date overflow-hidden rounded-sm border border-zinc-200 p-4 bg-zinc-50/50 flex items-center justify-between text-xs">
          <div className="grid grid-cols-3 gap-2 w-full">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 block mb-1">Arrival</span>
              <p className="font-medium font-sans text-zinc-800 truncate">{formatDisplayDate(checkinStr)}</p>
            </div>
            <div className="border-l border-zinc-200 pl-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 block mb-1">Departure</span>
              <p className="font-medium font-sans text-zinc-800 truncate">{formatDisplayDate(checkoutStr)}</p>
            </div>
            <div className="border-l border-zinc-200 pl-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 block mb-1">Occupancy</span>
              <p className="font-medium font-sans text-zinc-800 text-[11px] leading-tight">
                {adultsCount} {adultsCount === 1 ? "Adult" : "Adults"}
              </p>
              <p className="text-[10px] text-zinc-400 font-sans font-light mt-0.5">
                {childrenCount} {childrenCount === 1 ? "Child" : "Children"}
              </p>
            </div>
          </div>

          <Link 
            href={`/hotel-landing-page/availability?${searchParamsStr}`}
            className="absolute inset-0 flex items-center justify-center bg-zinc-950/0 group-hover/date:bg-zinc-950/60 transition-all duration-300 backdrop-blur-[0px] group-hover/date:backdrop-blur-[2px] opacity-0 group-hover/date:opacity-100 cursor-pointer text-center"
          >
            <span className="bg-white text-zinc-900 text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-sm shadow-xl transform translate-y-2 group-hover/date:translate-y-0 transition-all duration-300">
              Modify Dates
            </span>
          </Link>
        </div>

        <div className="pt-2 border-t border-zinc-100 space-y-3 text-xs font-sans">
          <div className="flex justify-between items-center text-zinc-500">
            <span>Room Rate ({totalNights} {totalNights === 1 ? "Night" : "Nights"})</span>
            <span className="font-medium text-zinc-800">₱{baseSubtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-500">
            <span>Taxes & Fees Included</span>
          </div>
          <div className="pt-5 border-t border-zinc-200 flex justify-between items-baseline">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">Total Invoice</span>
            <span className="text-2xl font-normal font-serif text-zinc-950">₱{totalInvoiceGross.toLocaleString()}</span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full py-4 bg-zinc-950 hover:bg-black disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <CreditCard size={13} />
          {isSubmitting ? "Processing Transaction..." : "Authorize Agreement & Pay"}
        </button>
      </div>
    </div>
  );
}
