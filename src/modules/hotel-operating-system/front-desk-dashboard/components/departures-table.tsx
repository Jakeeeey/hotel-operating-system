"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpFromLine, CalendarPlus, Receipt } from "lucide-react";

interface DepartureItem {
    reservationId: number;
    guestName: string;
    roomNumber: string;
    roomId: number | null;
    roomTypeName: string;
    status: string;
}

interface DeparturesTableProps {
    departures: DepartureItem[];
    isLoading?: boolean;
    onCheckOut: (departure: DepartureItem) => void;
    onExtendStay: (departure: DepartureItem) => void;
    onOpenFolio: (departure: DepartureItem) => void;
    checkingOutId: number | null;
}

export function DeparturesTable({ departures, isLoading, onCheckOut, onExtendStay, onOpenFolio, checkingOutId }: DeparturesTableProps) {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 15000); // Check every 15 seconds
        return () => clearInterval(interval);
    }, []);

    const getRowStyleAndStatus = () => {
        if (!currentTime) return { rowClass: "hover:bg-muted/20", badge: null };

        const checkoutLimit = new Date(currentTime);
        checkoutLimit.setHours(12, 0, 0, 0);

        const warningLimit = new Date(currentTime);
        warningLimit.setHours(11, 0, 0, 0);

        if (currentTime >= checkoutLimit) {
            return {
                rowClass: "bg-rose-50/60 hover:bg-rose-100/60 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 border-l-4 border-l-rose-500",
                badge: (
                    <Badge variant="destructive" className="bg-rose-600 text-white animate-pulse">
                        Late Checkout / Overstay
                    </Badge>
                )
            };
        } else if (currentTime >= warningLimit) {
            return {
                rowClass: "bg-amber-50/60 hover:bg-amber-100/60 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 border-l-4 border-l-amber-500",
                badge: (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                        Warning: Under 1 Hr
                    </Badge>
                )
            };
        }

        return { rowClass: "hover:bg-muted/20", badge: null };
    };

    return (
        <Card className="py-0 overflow-hidden">
            <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <div className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/40">
                        <ArrowUpFromLine className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    Departures
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                {/* Table Header */}
                <div className="grid grid-cols-[1.5fr_1fr_auto] gap-3 px-5 py-2.5 border-t bg-muted/30">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Guest
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Room
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                        Actions
                    </span>
                </div>

                {/* Rows */}
                {isLoading ? (
                    <div className="divide-y">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="grid grid-cols-[1.5fr_1fr_auto] gap-3 px-5 py-3.5 animate-pulse">
                                <div className="h-4 w-24 bg-muted rounded" />
                                <div className="h-4 w-20 bg-muted rounded" />
                                <div className="h-8 w-20 bg-muted rounded" />
                            </div>
                        ))}
                    </div>
                ) : departures.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                        No departures scheduled for today.
                    </div>
                ) : (
                    <div className="divide-y">
                        {departures.map((departure) => {
                            const { rowClass, badge } = getRowStyleAndStatus();
                            return (
                                <div
                                    key={departure.reservationId}
                                    className={`grid grid-cols-[1.5fr_1fr_auto] gap-3 items-center px-5 py-3.5 transition-all ${rowClass}`}
                                >
                                    <div className="flex items-center gap-2 text-sm font-medium overflow-hidden">
                                        <span className="truncate">{departure.guestName}</span>
                                        {badge}
                                    </div>
                                    <div className="text-sm truncate">
                                        <span className="font-medium">{departure.roomNumber}</span>
                                        {departure.roomTypeName && (
                                            <span className="text-muted-foreground ml-1">
                                                ({departure.roomTypeName})
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-end items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                                            onClick={() => onExtendStay(departure)}
                                            disabled={checkingOutId === departure.reservationId}
                                        >
                                            <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                                            Extend
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs font-semibold hover:bg-primary/10 hover:text-primary"
                                            onClick={() => onOpenFolio(departure)}
                                            disabled={checkingOutId === departure.reservationId}
                                        >
                                            <Receipt className="h-3.5 w-3.5 mr-1" />
                                            Folio
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 border-0"
                                            onClick={() => onCheckOut(departure)}
                                            disabled={checkingOutId === departure.reservationId}
                                        >
                                            {checkingOutId === departure.reservationId
                                                ? "Processing..."
                                                : "Check-Out"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {/* Bottom spacer */}
                <div className="h-2" />
            </CardContent>
        </Card>
    );
}
