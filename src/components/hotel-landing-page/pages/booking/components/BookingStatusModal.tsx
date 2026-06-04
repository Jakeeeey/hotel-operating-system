import { Check, AlertTriangle, X } from "lucide-react";

export interface ModalState {
  isOpen: boolean;
  type: "success" | "warning" | "error";
  title: string;
  description: string;
  reservationId?: string;
}

interface BookingStatusModalProps {
  modal: ModalState;
  onClose: () => void;
}

export function BookingStatusModal({ modal, onClose }: BookingStatusModalProps) {
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-[3px] flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      
      {/* Custom micro animation styling embedded to prevent code pollution elsewhere */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalPopIn {
          0% { transform: scale(0.96); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-modal-pop {
          animation: modalPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Modal Card wrapper with embedded smooth entry popup class */}
      <div className="bg-white max-w-sm w-full border border-zinc-200/80 p-7 rounded-sm shadow-2xl relative space-y-5 text-center select-none animate-modal-pop">
        
        {/* Minimalist Icon Block */}
        <div className="flex justify-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
            modal.type === "success" 
              ? "bg-zinc-50 border-zinc-200 text-zinc-900" 
              : modal.type === "warning"
              ? "bg-amber-50/60 border-amber-200/80 text-amber-600"
              : "bg-red-50/60 border-red-200/80 text-red-600"
          }`}>
            {modal.type === "success" && <Check size={18} strokeWidth={2.5} />}
            {modal.type === "warning" && <AlertTriangle size={18} strokeWidth={2.5} />}
            {modal.type === "error" && <X size={18} strokeWidth={2.5} />}
          </div>
        </div>

        {/* Structured Text Details Block */}
        <div className="space-y-1.5">
          <h3 className="font-serif text-lg tracking-tight text-zinc-900 font-normal">
            {modal.title}
          </h3>
          <p className="text-zinc-500 font-sans text-[11px] leading-relaxed max-w-[270px] mx-auto">
            {modal.description}
          </p>
        </div>

        {/* Displaying confirmation metrics cleanly */}
        {modal.type === "success" && modal.reservationId && (
          <div className="bg-zinc-50 border border-zinc-200/50 rounded-sm py-2.5 px-3 max-w-[240px] mx-auto font-sans">
            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-400 block mb-0.5">
              Reference Code
            </span>
            <span className="font-mono text-xs font-bold text-zinc-900 select-all tracking-wider">
              {modal.reservationId}
            </span>
          </div>
        )}

        {/* Primary Dismiss/Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-zinc-950 hover:bg-black text-white font-bold text-[9px] uppercase tracking-[0.2em] rounded-sm transition-colors cursor-pointer"
          >
            {modal.type === "success" ? "Continue" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}
