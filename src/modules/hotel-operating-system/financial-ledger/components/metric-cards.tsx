"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardsProps {
  metrics: {
    guestsStayed: number;
    totalRevenue: number;
  };
  isLoading: boolean;
}

export default function MetricCards({ metrics, isLoading }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Guests Stayed So Far</CardTitle>
          <div className="p-2 bg-primary/10 rounded-full">
            <Users className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <div className="text-3xl font-bold tracking-tight">
              {metrics.guestsStayed.toLocaleString()}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">For the selected period</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-full">
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mt-1" />
          ) : (
            <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Aggregated from all completed transactions</p>
        </CardContent>
      </Card>
    </div>
  );
}
