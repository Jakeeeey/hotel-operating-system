"use client";

import { useState, useEffect, useMemo } from "react";
import { TimelineGrid } from "./components/timeline-grid";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, subDays, startOfDay } from "date-fns";

export interface CalendarData {
    types: any[];
    rooms: any[];
    statuses: any[];
    reservationItems: any[];
    blockingTasks?: any[];
}

export default function AvailabilityCalendarModule() {
    const [viewMode, setViewMode] = useState<"2-week" | "1-month">("2-week");
    const [startDate, setStartDate] = useState<Date>(startOfDay(new Date()));
    const [data, setData] = useState<CalendarData | null>(null);
    const [loading, setLoading] = useState(true);

    const numDays = viewMode === "2-week" ? 14 : 30;
    const endDate = useMemo(() => addDays(startDate, numDays - 1), [startDate, numDays]);

    const fetchCalendarData = async (start: Date, end: Date) => {
        setLoading(true);
        try {
            const startStr = format(start, "yyyy-MM-dd");
            const endStr = format(end, "yyyy-MM-dd");

            const res = await fetch(`/api/hos/availability-calendar?start=${startStr}&end=${endStr}`);
            if (!res.ok) throw new Error("Failed to fetch calendar data");
            
            const json = await res.json();
            setData(json.data);
        } catch (error) {
            toast.error("Error loading availability calendar.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarData(startDate, endDate);
    }, [startDate, endDate]);

    const handlePrev = () => setStartDate(subDays(startDate, numDays));
    const handleNext = () => setStartDate(addDays(startDate, numDays));
    const handleToday = () => setStartDate(startOfDay(new Date()));

    return (
        <div className="p-4 md:p-6 space-y-6 w-full max-w-[1800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0">
                            <CalendarDays className="h-5 w-5" />
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Availability Calendar</h1>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Visual overview of reservations, availability gaps, and room statuses across time.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="bg-muted p-1 rounded-xl flex items-center gap-1 border shadow-sm">
                        <button
                            type="button"
                            onClick={() => setViewMode("2-week")}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                viewMode === "2-week" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            2 Weeks
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("1-month")}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                viewMode === "1-month" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            1 Month
                        </button>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-xl">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={handleToday} className="rounded-xl font-semibold">
                            Today
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleNext} className="rounded-xl">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="relative bg-card border rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                {loading && (
                    <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex items-center gap-2 text-primary font-medium bg-background px-4 py-2 rounded-full shadow-lg border">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Loading Timeline...
                        </div>
                    </div>
                )}
                
                {data && (
                    <TimelineGrid 
                        data={data} 
                        startDate={startDate} 
                        numDays={numDays} 
                    />
                )}
            </div>
        </div>
    );
}
