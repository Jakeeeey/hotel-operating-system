"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface PaymentRecord {
    id: number;
    reservation_id: number;
    amount: number;
    payment_method: string;
    payment_date: string;
    reference_number?: string;
    status: string;
    notes?: string;
    guestName: string;
    isOnline: boolean;
}

interface ChargeRecord {
    id: number;
    reservation_id: number;
    charge_type: string;
    description: string;
    amount: number;
    charge_date: string;
    guestName: string;
}

type LedgerEntry = {
    id: string;
    type: "Payment" | "Charge";
    reservationId: number;
    description: string;
    method: string;
    amount: number;
    status: string;
    date: string;
    guestName: string;
    isOnline?: boolean;
};

interface TransactionTableProps {
    payments: PaymentRecord[];
    charges: ChargeRecord[];
    isLoading?: boolean;
    onViewDetails: (reservationId: number) => void;
}

function statusBadgeVariant(status: string) {
    const s = status.toLowerCase();
    if (s === "settled" || s === "completed") return "default";
    if (s === "liability held") return "secondary";
    if (s === "refunded" || s === "voided") return "destructive";
    if (s === "pending") return "outline";
    return "outline";
}

export function TransactionTable({
    payments,
    charges,
    isLoading,
    onViewDetails,
}: TransactionTableProps) {
    // Merge payments + charges into a unified ledger
    const entries: LedgerEntry[] = [
        ...payments.map((p) => ({
            id: `pay-${p.id}`,
            type: "Payment" as const,
            reservationId: p.reservation_id,
            description: p.notes || "Payment",
            method: p.payment_method,
            amount: parseFloat(String(p.amount)) || 0,
            status: p.status,
            date: p.payment_date,
            guestName: p.guestName,
            isOnline: p.isOnline,
        })),
        ...charges.map((c) => ({
            id: `chg-${c.id}`,
            type: "Charge" as const,
            reservationId: c.reservation_id,
            description: c.description || c.charge_type,
            method: c.charge_type,
            amount: parseFloat(String(c.amount)) || 0,
            status: "Settled",
            date: c.charge_date,
            guestName: c.guestName,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
        );
    }

    return (
        <ScrollArea className="h-[400px] rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead>Online</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date/Time</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={9}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No transactions recorded this shift.
                            </TableCell>
                        </TableRow>
                    ) : (
                        entries.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell>
                                    <Badge
                                        variant={
                                            entry.type === "Payment"
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="text-xs"
                                    >
                                        {entry.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {entry.type === "Payment" ? (
                                        <Badge
                                            variant={entry.isOnline ? "default" : "outline"}
                                            className={`text-[10px] ${entry.isOnline ? "bg-violet-100 text-violet-800 hover:bg-violet-200 border-violet-200" : ""}`}
                                        >
                                            {entry.isOnline ? "Online" : "Walk-In"}
                                        </Badge>
                                    ) : null}
                                </TableCell>
                                <TableCell className="font-medium text-sm">
                                    {entry.guestName || `#${entry.reservationId}`}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    {entry.description}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {entry.method}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {fmtCurrency(entry.amount)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={statusBadgeVariant(entry.status)}
                                        className="text-xs"
                                    >
                                        {entry.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                    {fmtDate(entry.date)}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => onViewDetails(entry.reservationId)}
                                        title="View Invoice Details"
                                    >
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
    );
}
