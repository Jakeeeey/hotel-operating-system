"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShieldCheck, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ShiftStatCardsProps {
    recognizedRevenue: number;
    liabilities: number;
    expectedCash: number;
    startingCash: number;
    isLoading?: boolean;
}

export function ShiftStatCards({
    recognizedRevenue,
    liabilities,
    expectedCash,
    startingCash,
    isLoading,
}: ShiftStatCardsProps) {
    const fmt = (n: number) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(n);

    const cards = [
        {
            label: "Recognized Revenue",
            value: fmt(recognizedRevenue),
            sub: "Settled payments this shift",
            icon: DollarSign,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/40",
        },
        {
            label: "Active Liabilities",
            value: fmt(liabilities),
            sub: "Incidental deposit holds",
            icon: ShieldCheck,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/40",
        },
        {
            label: "Expected Cash Drawer",
            value: fmt(expectedCash),
            sub: `Starting float: ${fmt(startingCash)}`,
            icon: Wallet,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950/40",
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
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-8 w-28" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        ) : (
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className={`text-sm font-medium ${card.color}`}>
                                        {card.label}
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight">
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
