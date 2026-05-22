"use client";

import { BookingForm } from "./components/booking-form";
import { Sparkles } from "lucide-react";

export default function RoomBookingModule() {
    return (
        <div className="p-4 md:p-6 space-y-6 w-full max-w-[1800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0">
                            <Sparkles className="h-5 w-5" />
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Room Booking</h1>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Book a guest for a future stay or perform an immediate check-in for walk-in arrivals.
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <BookingForm />
        </div>
    );
}
