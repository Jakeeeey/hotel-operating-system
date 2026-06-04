import { UseFormRegister, FieldErrors } from "react-hook-form";
import { BookingFormValues } from "../schema/booking.schema";

interface BookingFormFieldsProps {
  register: UseFormRegister<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
}

export function BookingFormFields({ register, errors }: BookingFormFieldsProps) {
  return (
    <div className="lg:col-span-7 space-y-10">
      <div className="border border-zinc-200 bg-white p-6 rounded-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">01</span>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">Guest Documentation Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">First Name</label>
            <input type="text" {...register("firstName")} placeholder="Juan" className={`w-full h-10 px-3 text-sm text-zinc-900 bg-zinc-50/50 border rounded-sm outline-none font-sans transition-all placeholder:text-zinc-300 ${errors.firstName ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'}`} />
            {errors.firstName && <p className="text-red-500 text-[11px] tracking-normal font-sans mt-1">*{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">Last Name</label>
            <input type="text" {...register("lastName")} placeholder="Dela Cruz" className={`w-full h-10 px-3 text-sm text-zinc-900 bg-zinc-50/50 border rounded-sm outline-none font-sans transition-all placeholder:text-zinc-300 ${errors.lastName ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'}`} />
            {errors.lastName && <p className="text-red-500 text-[11px] tracking-normal font-sans mt-1">*{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">Email Address</label>
            <input type="email" {...register("email")} placeholder="juan@gmail.com" className={`w-full h-10 px-3 text-sm text-zinc-900 bg-zinc-50/50 border rounded-sm outline-none font-sans transition-all placeholder:text-zinc-300 ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'}`} />
            {errors.email && <p className="text-red-500 text-[11px] tracking-normal font-sans mt-1">*{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">Contact Number</label>
            <input type="tel" {...register("phone")} placeholder="09171234567" className={`w-full h-10 px-3 text-sm text-zinc-900 bg-zinc-50/50 border rounded-sm outline-none font-sans transition-all placeholder:text-zinc-300 ${errors.phone ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'}`} />
            {errors.phone && <p className="text-red-500 text-[11px] tracking-normal font-sans mt-1">*{errors.phone.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">Special Requests</label>
          <textarea {...register("specialRequests")} rows={3} placeholder="Interconnected room constraints, accessibility adjustments, or structural preferences..." className="w-full p-3 text-sm text-zinc-900 bg-zinc-50/50 border border-zinc-200 rounded-sm focus:border-zinc-900 focus:bg-white outline-none resize-none font-sans transition-all placeholder:text-zinc-300" />
        </div>
      </div>

      <div className="border border-zinc-200 bg-white p-6 rounded-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">02</span>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">Mobile Wallet Gateway Verification</h2>
          </div>
          <span className="bg-zinc-950 text-white font-sans text-[9px] font-black tracking-[0.2em] px-2.5 py-1 rounded-sm select-none">GCASH</span>
        </div>
        
        <div className="space-y-1.5 max-w-sm">
          <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">GCash Mobile Number</label>
          <input type="text" {...register("gcashNumber")} placeholder="09171234567" className={`w-full h-10 px-3 text-sm text-zinc-900 bg-zinc-50/50 border rounded-sm outline-none font-sans transition-all placeholder:text-zinc-300 ${errors.gcashNumber ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900 focus:bg-white'}`} />
          {errors.gcashNumber && <p className="text-red-500 text-[11px] tracking-normal font-sans mt-1">*{errors.gcashNumber.message}</p>}
        </div>
      </div>
    </div>
  );
}
