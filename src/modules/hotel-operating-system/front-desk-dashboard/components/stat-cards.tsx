"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Building2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

interface StatsData {
    totalRooms: number;
    availableRooms: number;
    pendingArrivals: number;
    totalArrivals: number;
    pendingDepartures: number;
    totalDepartures: number;
    completedCheckouts: number;
}

interface StatCardsProps {
    stats: StatsData;
    isLoading?: boolean;
}

export function StatCards({ stats, isLoading }: StatCardsProps) {
    const cards = [
        {
            label: "Rooms Available",
            value: stats.availableRooms?.toString() || "0",
            sub: `${stats.availableRooms || 0} out of ${stats.totalRooms || 0} rooms available`,
            icon: Building2,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950/40",
        },
        {
            label: "Pending Arrivals",
            value: stats.pendingArrivals.toString(),
            sub: `Out of ${stats.totalArrivals} scheduled today`,
            icon: ArrowDownToLine,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/40",
        },
        {
            label: "Pending Departures",
            value: stats.pendingDepartures.toString(),
            sub: `${stats.completedCheckouts} already checked out`,
            icon: ArrowUpFromLine,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/40",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((card) => (
                <Card
                    key={card.label}
                    className="py-4 hover:shadow-md transition-shadow duration-200"
                >
                    <CardContent className="px-5 py-0">
                        {isLoading ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-3 w-24 bg-muted rounded" />
                                <div className="h-8 w-16 bg-muted rounded" />
                                <div className="h-3 w-32 bg-muted rounded" />
                            </div>
                        ) : (
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className={`text-sm font-medium ${card.color}`}>
                                        {card.label}
                                    </p>
                                    <p className="text-3xl font-bold tracking-tight">
                                        {card.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {card.sub}
                                    </p>
                                </div>
                                <div className={`p-2 rounded-lg ${card.bg}`}>
                                    <card.icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
