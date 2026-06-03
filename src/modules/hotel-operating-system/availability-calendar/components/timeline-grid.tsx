"use client";

import { useMemo } from "react";
import { format, addDays } from "date-fns";
import { CalendarData } from "../index";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TimelineGridProps {
    data: CalendarData;
    startDate: Date;
    numDays: number;
}

export function TimelineGrid({ data, startDate, numDays }: TimelineGridProps) {
    const dateCols = useMemo(() => {
        return Array.from({ length: numDays }).map((_, i) => addDays(startDate, i));
    }, [startDate, numDays]);

    const getManilaISOString = (d: Date = new Date()) => {
        const manilaDate = new Date(d.getTime() + 8 * 60 * 60 * 1000);
        return manilaDate.toISOString().replace('Z', '');
    };

    const getStatusColors = (status: string) => {
        switch (status) {
            case "Pending":
                return "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-300";
            case "Checked-In":
                return "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300";
            case "Checked-Out":
                return "bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400";
            default:
                return "bg-muted border-muted-foreground/30 text-muted-foreground";
        }
    };

    const renderRow = (
        key: string,
        label: string,
        subLabel: string | null,
        roomId: number | null,
        typeId: number,
        isUnassigned: boolean
    ) => {
        return (
            <div key={key} className="flex border-b border-muted/50 group/row hover:bg-muted/10 transition-colors">
                {/* Y-Axis Label (Sticky Left) */}
                <div className="w-[200px] shrink-0 border-r border-muted/50 p-3 sticky left-0 z-20 bg-card group-hover/row:bg-muted/30 transition-colors flex flex-col justify-center">
                    <span className="font-semibold text-sm truncate">{label}</span>
                    {subLabel && <span className="text-xs text-muted-foreground truncate">{subLabel}</span>}
                </div>

                {/* X-Axis Grid Cells */}
                {dateCols.map((d) => {
                    const dateStr = format(d, "yyyy-MM-dd");

                    // Find if this date falls within a reservation for this room
                    const res = data.reservations?.find((r) => {
                        const matchesRoom = isUnassigned
                            ? r.room_id === null && r.room_type_id === typeId
                            : r.room_id === roomId;
                            
                        if (!matchesRoom || !r.check_in_date || !r.check_out_date) return false;
                        
                        return dateStr >= r.check_in_date && dateStr < r.check_out_date;
                    });

                    // Check for blocking tasks
                    let blockedTask = null;
                    if (!res && !isUnassigned && data.blockingTasks) {
                        blockedTask = data.blockingTasks.find((t) => {
                            const tRoomId = typeof t.room_id === 'object' && t.room_id !== null ? t.room_id.id : t.room_id;
                            if (Number(tRoomId) !== Number(roomId)) return false;
                            
                            const start = t.start_time || t.created_at || getManilaISOString();
                            let end = t.target_completion_time || t.actual_completion_time;
                            if (!end) {
                                const endDateObj = new Date(start);
                                endDateObj.setDate(endDateObj.getDate() + 1); // Assume 1 day block if no target time
                                end = getManilaISOString(endDateObj);
                            }
                            
                            const blockStart = format(new Date(start), "yyyy-MM-dd");
                            const blockEnd = format(new Date(end), "yyyy-MM-dd");
                            
                            return dateStr >= blockStart && dateStr <= blockEnd;
                        });
                    }

                    if (!res && !blockedTask) {
                        return (
                            <div key={dateStr} className="flex-1 min-w-[70px] md:min-w-[90px] border-r border-muted/20 p-1" />
                        );
                    }

                    // Render Blocked Room Item
                    if (blockedTask) {
                        const start = blockedTask.start_time || blockedTask.created_at || getManilaISOString();
                        const blockStart = format(new Date(start), "yyyy-MM-dd");
                        
                        let end = blockedTask.target_completion_time || blockedTask.actual_completion_time;
                        if (!end) {
                            const endDateObj = new Date(start);
                            endDateObj.setDate(endDateObj.getDate() + 1);
                            end = getManilaISOString(endDateObj);
                        }
                        const blockEnd = format(new Date(end), "yyyy-MM-dd");

                        const isStart = dateStr === blockStart;
                        const isEnd = dateStr === blockEnd;
                        const colorClasses = "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300";
                        
                        return (
                            <div key={dateStr} className="flex-1 min-w-[70px] md:min-w-[90px] border-r border-muted/20 relative py-1.5 px-0.5">
                                <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={`absolute inset-y-1.5 inset-x-0 border-y ${colorClasses} shadow-sm z-10 flex items-center overflow-hidden cursor-pointer
                                                    ${isStart ? "rounded-l-lg border-l ml-1" : "border-l-0"}
                                                    ${isEnd ? "rounded-r-lg border-r mr-1" : "border-r-0"}
                                                `}
                                            >
                                                {(isStart || dateStr === format(startDate, "yyyy-MM-dd")) && (
                                                    <span className="text-[10px] md:text-xs font-semibold px-2 truncate whitespace-nowrap z-20 sticky left-0">
                                                        Maintenance
                                                    </span>
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="space-y-1.5 p-3 rounded-xl shadow-xl border-red-200">
                                            <div className="font-bold border-b pb-1 mb-1 text-red-600">Room Blocked</div>
                                            <div className="text-xs">
                                                <span className="font-semibold block">{blockedTask.task_type}</span>
                                                <span className="text-muted-foreground block mt-1">{blockedTask.task_description || 'No description provided'}</span>
                                                <span className="text-muted-foreground block mt-2 text-[10px]">Status: {blockedTask.status}</span>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        );
                    }

                    // Render Reservation Block
                    if (!res) return null; // Should never happen
                    const resInfo = res;
                    const isStart = resInfo?.check_in_date === dateStr;
                    
                    // The night before checkout is the last 'night_date'
                    // So if next day is checkout date, this is the end block.
                    const nextDayStr = format(addDays(d, 1), "yyyy-MM-dd");
                    const isEnd = resInfo?.check_out_date === nextDayStr;

                    const colorClasses = getStatusColors(resInfo?.status || "");
                    const guestName = resInfo?.guest_id 
                        ? `${resInfo.guest_id.first_name} ${resInfo.guest_id.last_name}` 
                        : "Unknown Guest";

                    return (
                        <div key={dateStr} className="flex-1 min-w-[70px] md:min-w-[90px] border-r border-muted/20 relative py-1.5 px-0.5">
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`absolute inset-y-1.5 inset-x-0 border-y ${colorClasses} shadow-sm z-10 flex items-center overflow-hidden cursor-pointer
                                                ${isStart ? "rounded-l-lg border-l ml-1" : "border-l-0"}
                                                ${isEnd ? "rounded-r-lg border-r mr-1" : "border-r-0"}
                                            `}
                                        >
                                            {/* Only show text on the start block, or if it's the first day visible in the current view */}
                                            {(isStart || dateStr === format(startDate, "yyyy-MM-dd")) && (
                                                <span className="text-[10px] md:text-xs font-semibold px-2 truncate whitespace-nowrap z-20 sticky left-0">
                                                    {guestName}
                                                </span>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="space-y-1.5 p-3 rounded-xl shadow-xl">
                                        <div className="font-bold border-b pb-1 mb-1">{guestName}</div>
                                        <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                                            <span className="text-muted-foreground">Status:</span>
                                            <span className="font-semibold">{resInfo?.status}</span>
                                            <span className="text-muted-foreground">Check-In:</span>
                                            <span>{resInfo?.check_in_date}</span>
                                            <span className="text-muted-foreground">Check-Out:</span>
                                            <span>{resInfo?.check_out_date}</span>
                                            <span className="text-muted-foreground">Locked Rate:</span>
                                            <span>₱{Number(resInfo.locked_price).toLocaleString()}</span>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="overflow-x-auto w-full pb-4 hide-scrollbar">
            <div className="w-full min-w-max">
                {/* Header Row (Dates) */}
                <div className="flex border-b bg-muted/10 sticky top-0 z-30">
                    <div className="w-[200px] shrink-0 border-r p-3 sticky left-0 z-40 bg-card/95 backdrop-blur-md shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)] flex items-end">
                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Room / Date</span>
                    </div>
                    {dateCols.map((d) => {
                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                        const isToday = format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                        
                        return (
                            <div 
                                key={d.toISOString()} 
                                className={`flex-1 min-w-[70px] md:min-w-[90px] border-r p-2 flex flex-col items-center justify-center
                                    ${isWeekend ? "bg-muted/30" : ""}
                                    ${isToday ? "bg-primary/5 border-b-2 border-b-primary" : ""}
                                `}
                            >
                                <span className={`text-[10px] md:text-xs font-medium uppercase ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                                    {format(d, "EEE")}
                                </span>
                                <span className={`text-sm md:text-base font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                                    {format(d, "d")}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Body Rows */}
                {data.types.map((type) => {
                    const typeRooms = data.rooms.filter((r) => r.type_id === type.id);
                    if (typeRooms.length === 0) return null;
                    
                    return (
                        <div key={type.id}>
                            {/* Room Type Group Header */}
                            <div className="flex bg-muted/40 border-b border-muted/60">
                                <div className="w-[200px] shrink-0 border-r border-muted/50 px-3 py-2 sticky left-0 z-30 bg-muted/95 backdrop-blur-md">
                                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                        {type.type_name}
                                    </span>
                                </div>
                                <div className="flex-1" />
                            </div>

                            {/* Actual Rooms */}
                            {typeRooms.map((room) => {
                                const statusName = room.operational_status_id?.status_name || "Unknown";
                                return renderRow(
                                    `room-${room.id}`,
                                    `Room ${room.room_number}`,
                                    statusName,
                                    room.id,
                                    type.id,
                                    false
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
