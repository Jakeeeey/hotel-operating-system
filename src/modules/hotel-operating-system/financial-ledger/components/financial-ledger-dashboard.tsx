"use client";

import React, { useState, useEffect, useCallback } from "react";
import MetricCards from "./metric-cards";
import TransactionFilter from "./transaction-filter";
import TransactionTable from "./transaction-table";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { toast } from "sonner";

export interface TransactionRecord {
  id: string;
  guestName: string;
  transaction: string; // Online, Manual, etc.
  type: string; // Payment, Charge
  method: string; // Credit Card, Cash
  amount: number;
  status: string;
  dateTime: string;
}

export default function FinancialLedgerDashboard() {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({ guestsStayed: 0, totalRevenue: 0 });
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchLedgerData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (dateRange.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append("endDate", dateRange.to.toISOString());
      }

      const response = await fetch(`/api/hos/financial-ledger?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch ledger data");
      }

      const data = await response.json();
      setMetrics(data.metrics || { guestsStayed: 0, totalRevenue: 0 });
      setTransactions(data.transactions?.data || []);
      setTotalPages(data.transactions?.totalPages || 1);
      setTotalRecords(data.transactions?.totalRecords || 0);
    } catch (error) {
      console.error(error);
      toast.error("Could not load financial data.");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, page, limit]);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  // When date changes, reset page to 1
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground bg-clip-text">Financial Ledger</h1>
          <p className="text-muted-foreground mt-1">
            View detailed transaction reports and revenue metrics for your property.
          </p>
        </div>
        <TransactionFilter dateRange={dateRange} onChange={handleDateRangeChange} />
      </div>

      <div className="w-full">
        <MetricCards metrics={metrics} isLoading={isLoading} />
      </div>

      <div className="mt-2 rounded-xl border bg-card/50 backdrop-blur-md shadow-sm overflow-hidden transition-all hover:shadow-md">
        <TransactionTable 
          transactions={transactions} 
          isLoading={isLoading} 
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
        />
      </div>
    </div>
  );
}
