"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownToLine, CheckCircle2 } from "lucide-react";

interface ArrivalItem {
    reservationId: number;
    guestName: string;
    roomTypeName: string;
    roomTypeId: number | null;
    status: string;
    roomId: number | null;
    roomNumber: string | null;
}

interface ArrivalsTableProps {
    arrivals: ArrivalItem[];
    isLoading?: boolean;
    onCheckIn: (arrival: ArrivalItem) => void;
}

export function ArrivalsTable({ arrivals, isLoading, onCheckIn }: ArrivalsTableProps) {
    return (
        <Card className="py-0 overflow-hidden">
            <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40">
                        <ArrowDownToLine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Arrivals
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 px-5 py-2.5 border-t bg-muted/30">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Guest
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Room Type
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                        Action
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
                ) : arrivals.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                        No arrivals scheduled for today.
                    </div>
                ) : (
                    <div className="divide-y">
                        {arrivals.map((arrival) => (
                            <div
                                key={arrival.reservationId}
                                className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors"
                            >
                                <span className="text-sm font-medium truncate">
                                    {arrival.guestName}
                                </span>
                                <span className="text-sm text-muted-foreground truncate">
                                    {arrival.roomTypeName}
                                </span>
                                <div className="flex justify-end">
                                    {arrival.status === "Checked-In" ? (
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Checked In
                                        </Badge>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="h-8 text-xs font-semibold"
                                            onClick={() => onCheckIn(arrival)}
                                        >
                                            Check-In
                                        </Button>
                                    )}
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
