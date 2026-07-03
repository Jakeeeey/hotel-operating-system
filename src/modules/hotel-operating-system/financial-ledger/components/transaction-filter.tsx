"use client";

import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface TransactionFilterProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export default function TransactionFilter({ dateRange, onChange }: TransactionFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    {
      label: "Current Month",
      onClick: () => onChange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
    },
    {
      label: "Last Month",
      onClick: () => {
        const lastMonth = subMonths(new Date(), 1);
        onChange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
      },
    },
    {
      label: "This Year",
      onClick: () => onChange({ from: startOfYear(new Date()), to: endOfYear(new Date()) }),
    },
    {
      label: "All Time",
      onClick: () => onChange({ from: undefined, to: undefined }),
    },
  ];

  const getDisplayValue = () => {
    if (!dateRange.from && !dateRange.to) return "All Time";
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    if (dateRange.from) return `From ${format(dateRange.from, "MMM d, yyyy")}`;
    return "Select date range";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full sm:w-[280px] justify-between font-medium bg-background hover:bg-muted/50 border-border/60 transition-colors shadow-sm"
        >
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            <span className="truncate">{getDisplayValue()}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col border-r border-border p-2 min-w-[140px]">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                className="justify-start font-normal text-sm"
                onClick={() => {
                  preset.onClick();
                  setIsOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="p-2">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => {
                if (range) {
                  onChange({ from: range.from, to: range.to });
                } else {
                  onChange({ from: undefined, to: undefined });
                }
              }}
              numberOfMonths={2}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
