"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, DoorOpen, DoorClosed, RotateCcw } from "lucide-react";

import { ShiftStatCards } from "./components/stat-cards";
import { TransactionTable } from "./components/transaction-table";
import { OpenShiftDialog } from "./components/open-shift-dialog";
import { CloseShiftDialog } from "./components/close-shift-dialog";

interface ActiveShift {
    id: number;
    user_id: number | null;
    opened_at: string;
    starting_cash: number;
    status: string;
}

interface PaymentRecord {
    id: number;
    reservation_id: number;
    amount: number;
    payment_method: string;
    payment_date: string;
    reference_number?: string;
    status: string;
    notes?: string;
}

interface ChargeRecord {
    id: number;
    reservation_id: number;
    charge_type: string;
    description: string;
    amount: number;
    charge_date: string;
}

interface Aggregates {
    recognizedRevenue: number;
    liabilities: number;
    expectedCash: number;
}

export default function ShiftLedgerModule() {
    const [loading, setLoading] = useState(true);
    const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [charges, setCharges] = useState<ChargeRecord[]>([]);
    const [aggregates, setAggregates] = useState<Aggregates>({
        recognizedRevenue: 0,
        liabilities: 0,
        expectedCash: 0,
    });

    // Dialog states
    const [openShiftDialog, setOpenShiftDialog] = useState(false);
    const [closeShiftDialog, setCloseShiftDialog] = useState(false);

    const fetchLedger = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hos/shift-ledger");
            const result = await res.json();
            if (result.data) {
                setActiveShift(result.data.activeShift || null);
                setPayments(result.data.payments || []);
                setCharges(result.data.charges || []);
                setAggregates(
                    result.data.aggregates || {
                        recognizedRevenue: 0,
                        liabilities: 0,
                        expectedCash: 0,
                    }
                );
            }
        } catch {
            toast.error("Failed to load shift ledger data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    // Date display
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    const fmtTime = (iso: string) => {
        try {
            const dateStr = iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`;
            return new Date(dateStr).toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch {
            return iso;
        }
    };

    return (
        <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Shift Ledger
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{dateStr}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchLedger}
                        disabled={loading}
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>

                    {!activeShift ? (
                        <Button onClick={() => setOpenShiftDialog(true)}>
                            <DoorOpen className="h-4 w-4 mr-2" />
                            Open Shift
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={() => setCloseShiftDialog(true)}
                        >
                            <DoorClosed className="h-4 w-4 mr-2" />
                            Close Shift
                        </Button>
                    )}
                </div>
            </div>

            {/* Active Shift Banner */}
            {activeShift ? (
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <CardContent className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                Active
                            </Badge>
                            <span className="text-sm font-medium">
                                Shift #{activeShift.id}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Opened at {fmtTime(activeShift.opened_at)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                    <CardContent className="px-5 py-3 flex items-center gap-3">
                        <Badge
                            variant="outline"
                            className="border-amber-500 text-amber-700 dark:text-amber-400"
                        >
                            No Active Shift
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            Open a shift to begin tracking transactions.
                        </span>
                    </CardContent>
                </Card>
            )}

            {/* Stat Cards */}
            <ShiftStatCards
                recognizedRevenue={aggregates.recognizedRevenue}
                liabilities={aggregates.liabilities}
                expectedCash={aggregates.expectedCash}
                startingCash={
                    activeShift
                        ? parseFloat(String(activeShift.starting_cash)) || 0
                        : 0
                }
                isLoading={loading}
            />

            {/* Transaction Ledger */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Transaction Ledger</CardTitle>
                </CardHeader>
                <CardContent>
                    <TransactionTable
                        payments={payments}
                        charges={charges}
                        isLoading={loading}
                    />
                </CardContent>
            </Card>

            {/* Dialogs */}
            <OpenShiftDialog
                open={openShiftDialog}
                onOpenChange={setOpenShiftDialog}
                onSuccess={fetchLedger}
            />
            <CloseShiftDialog
                open={closeShiftDialog}
                onOpenChange={setCloseShiftDialog}
                shiftId={activeShift?.id || null}
                expectedCash={aggregates.expectedCash}
                onSuccess={fetchLedger}
            />
        </div>
    );
}
