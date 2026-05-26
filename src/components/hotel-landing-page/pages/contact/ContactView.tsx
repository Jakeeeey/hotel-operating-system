"use client";

import { Mail, Phone, MapPin, Send } from "lucide-react";

export function ContactView() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
      {/* Header aligned to LocationView style */}
      <div className="mb-12 pb-6 border-b border-zinc-200">
        <h1 className="text-3xl font-serif text-zinc-950">Inquiries & Connectivity</h1>
      </div>

      {/* Functional Google Maps Embed (Public URL - No API Key Required) */}
      <div className="w-full aspect-[4/3] bg-zinc-100 rounded-xl overflow-hidden mb-12 border border-zinc-200 shadow-sm">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61545.98771439972!2d120.3109315867936!3d16.03923058866567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3391667b36f18395%3A0x6b498f395e86574f!2sDagupan%20City%2C%20Pangasinan!5e0!3m2!1sen!2sph!4v1716382000000!5m2!1sen!2sph"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Contact Form Section */}
      <div className="bg-zinc-50 p-8 rounded-xl border border-zinc-200 mb-12">
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" className="w-full border border-zinc-200 p-3 text-sm focus:outline-zinc-950" />
            <input type="email" placeholder="Electronic Mail" className="w-full border border-zinc-200 p-3 text-sm focus:outline-zinc-950" />
          </div>
          <textarea placeholder="Your Request / Inbound Details" rows={5} className="w-full border border-zinc-200 p-3 text-sm focus:outline-zinc-950" />
          <button className="flex items-center gap-2 bg-zinc-950 text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
         Submit 
          </button>
        </form>
      </div>

      {/* Contact Details */}
      <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200 space-y-4">
        <h3 className="text-lg font-serif">Operations Sanctuary</h3>
        <div className="space-y-4 pt-4 border-t border-zinc-200">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-zinc-400" />
            <p className="text-xs text-zinc-500 font-light">Dagupan City, Pangasinan, Philippines</p>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-zinc-400" />
            <p className="text-xs text-zinc-500 font-light">concierge@brand.com</p>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-zinc-400" />
            <p className="text-xs text-zinc-500 font-light">+63 (75) 555-0123</p>
          </div>
        </div>
      </div>
    </div>
  );
}