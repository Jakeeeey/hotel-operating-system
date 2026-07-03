"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMemo, useRef, useEffect } from "react";

interface PaymentRecord {
    id: number;
    reservation_id: number;
    amount: number;
    payment_method: string;
    payment_date: string;
    reference_number?: string;
    status: string;
    notes?: string;
    guestName?: string;
    isOnline?: boolean;
}

interface ChargeRecord {
    id: number;
    reservation_id: number;
    charge_type: string;
    description: string;
    amount: number;
    charge_date: string;
    guestName?: string;
}

interface InvoiceDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservationId: number | null;
    payments: PaymentRecord[];
    charges: ChargeRecord[];
}

function statusBadgeVariant(status: string) {
    const s = status.toLowerCase();
    if (s === "settled" || s === "completed") return "default";
    if (s === "liability held") return "secondary";
    if (s === "refunded" || s === "voided") return "destructive";
    if (s === "pending") return "outline";
    return "outline";
}

const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(n);

const fmtDate = (d: string) => {
    try {
        const dateStr = d.endsWith("Z") || d.includes("+") ? d : `${d}Z`;
        return new Date(dateStr).toLocaleString("en-PH", {
            timeZone: "Asia/Manila",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return d;
    }
};

export function InvoiceDetailDialog({
    open,
    onOpenChange,
    reservationId,
    payments,
    charges,
}: InvoiceDetailDialogProps) {
    // Filter records by reservationId
    const prevResIdRef = useRef(reservationId);
    useEffect(() => {
        if (reservationId !== null) {
            prevResIdRef.current = reservationId;
        }
    }, [reservationId]);
    
    const activeResId = reservationId ?? prevResIdRef.current;

    const resPayments = useMemo(() => {
        if (!activeResId) return [];
        return payments.filter((p) => p.reservation_id === activeResId);
    }, [activeResId, payments]);

    const resCharges = useMemo(() => {
        if (!activeResId) return [];
        return charges.filter((c) => c.reservation_id === activeResId);
    }, [activeResId, charges]);

    // Calculate totals
    const totalPayments = resPayments.reduce((acc, p) => acc + (parseFloat(String(p.amount)) || 0), 0);
    const totalCharges = resCharges.reduce((acc, c) => acc + (parseFloat(String(c.amount)) || 0), 0);
    const grandTotal = totalPayments + totalCharges;

    // Guest info from first available record
    const guestName = resPayments[0]?.guestName || resCharges[0]?.guestName || "Unknown Guest";
    const isOnline = resPayments[0]?.isOnline ?? false; // Safely fall back to Walk-In if unknown

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl sm:max-w-5xl w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                Invoice Details
                                <Badge variant={isOnline ? "default" : "outline"} className={isOnline ? "bg-violet-100 text-violet-800 hover:bg-violet-200 border-violet-200" : ""}>
                                    {isOnline ? "Online" : "Walk-In"}
                                </Badge>
                            </DialogTitle>
                            <div className="text-muted-foreground mt-1 flex items-center gap-2">
                                <span className="font-medium text-foreground">{guestName}</span>
                                <span>•</span>
                                <span>Reservation #{activeResId}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-8">
                        {/* Payments Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex justify-between items-center">
                                Payments
                                <span className="text-sm font-normal text-muted-foreground">
                                    Subtotal: {fmtCurrency(totalPayments)}
                                </span>
                            </h3>
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Date/Time</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {resPayments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                                                    No payments recorded.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            resPayments.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="text-sm">{fmtDate(p.payment_date)}</TableCell>
                                                    <TableCell>{p.notes || "Payment"}</TableCell>
                                                    <TableCell>{p.payment_method}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={statusBadgeVariant(p.status)} className="text-xs">
                                                            {p.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {fmtCurrency(parseFloat(String(p.amount)) || 0)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <Separator />

                        {/* Charges Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex justify-between items-center">
                                Charges
                                <span className="text-sm font-normal text-muted-foreground">
                                    Subtotal: {fmtCurrency(totalCharges)}
                                </span>
                            </h3>
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Date/Time</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {resCharges.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                                    No charges recorded.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            resCharges.map((c) => (
                                                <TableRow key={c.id}>
                                                    <TableCell className="text-sm">{fmtDate(c.charge_date)}</TableCell>
                                                    <TableCell>{c.charge_type}</TableCell>
                                                    <TableCell>{c.description || c.charge_type}</TableCell>
                                                    <TableCell className="text-right font-medium text-amber-600 dark:text-amber-400">
                                                        {fmtCurrency(parseFloat(String(c.amount)) || 0)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-6 border-t bg-muted/20">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Grand Total</span>
                        <span>{fmtCurrency(grandTotal)}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
