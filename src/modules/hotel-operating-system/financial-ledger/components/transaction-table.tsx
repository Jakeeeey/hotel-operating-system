"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TransactionRecord } from "./financial-ledger-dashboard";

interface TransactionTableProps {
  transactions: TransactionRecord[];
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalRecords: number;
}

export default function TransactionTable({
  transactions,
  isLoading,
  page,
  setPage,
  totalPages,
  totalRecords,
}: TransactionTableProps) {

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === "settled" || s === "completed")
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800";
    if (s === "pending" || s === "liability held")
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800";
    if (s === "refunded" || s === "voided" || s === "failed")
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800";
    if (s === "applied")
      return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800";
    return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  };

  const getTransactionBadgeClass = (tx: string) => {
    return tx === "Online"
      ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800"
      : "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  };

  const getAmountClass = (amount: number) => {
    if (amount >= 0) return "text-emerald-600 dark:text-emerald-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="overflow-auto rounded-t-xl">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-md">
            <TableRow className="hover:bg-transparent border-b-border/50">
              <TableHead className="font-semibold">Date & Time</TableHead>
              <TableHead className="font-semibold">Guest Name</TableHead>
              <TableHead className="font-semibold">Transaction</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Method</TableHead>
              <TableHead className="font-semibold text-right">Amount</TableHead>
              <TableHead className="font-semibold text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b-border/30">
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <TableRow key={tx.id} className="border-b-border/30 transition-colors hover:bg-muted/30">
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {tx.dateTime ? format(new Date(tx.dateTime), "MMM d, yyyy h:mm a") : "-"}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {tx.guestName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs font-normal ${getTransactionBadgeClass(tx.transaction)}`}>
                      {tx.transaction}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {tx.type}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tx.method}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${getAmountClass(tx.amount)}`}>
                    {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={`capitalize font-medium shadow-sm ${getStatusBadgeClass(tx.status)}`}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No transactions found for the selected period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{transactions.length}</span> of{" "}
          <span className="font-medium text-foreground">{totalRecords}</span> records
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || isLoading}
            className="h-8 shadow-sm transition-all hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm font-medium px-2 text-foreground">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || totalPages === 0 || isLoading}
            className="h-8 shadow-sm transition-all hover:bg-background"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
