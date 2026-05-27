"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpFromLine, CalendarPlus } from "lucide-react";

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
    checkingOutId: number | null;
}

export function DeparturesTable({ departures, isLoading, onCheckOut, onExtendStay, checkingOutId }: DeparturesTableProps) {
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
                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 px-5 py-2.5 border-t bg-muted/30">
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
                            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 px-5 py-3.5 animate-pulse">
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
                        {departures.map((departure) => (
                            <div
                                key={departure.reservationId}
                                className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors"
                            >
                                <span className="text-sm font-medium truncate">
                                    {departure.guestName}
                                </span>
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
                        ))}
                    </div>
                )}
                {/* Bottom spacer */}
                <div className="h-2" />
            </CardContent>
        </Card>
    );
}
