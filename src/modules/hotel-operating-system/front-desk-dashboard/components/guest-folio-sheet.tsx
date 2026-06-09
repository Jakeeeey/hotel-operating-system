"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    Receipt,
    Plus,
    CreditCard,
    Loader2,
    Printer,
    AlertTriangle,
} from "lucide-react";

interface ChargeItem {
    id: number;
    charge_type: string;
    description: string;
    amount: number;
    charge_date: string;
}

interface PaymentItem {
    id: number;
    amount: number;
    payment_method: string;
    payment_date: string;
    reference_number: string | null;
    status: string;
    notes: string | null;
}

interface GuestFolioSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservationId: number | null;
    guestName: string;
    roomNumber: string;
    roomId: number | null;
    roomTypeName: string;
    onCheckOutSuccess: () => void;
}

export function GuestFolioSheet({
    open,
    onOpenChange,
    reservationId,
    guestName,
    roomNumber,
    roomId,
    roomTypeName,
    onCheckOutSuccess,
}: GuestFolioSheetProps) {
    const [charges, setCharges] = useState<ChargeItem[]>([]);
    const [payments, setPayments] = useState<PaymentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);

    // Add Charge dialog state
    const [addChargeOpen, setAddChargeOpen] = useState(false);
    const [chargeType, setChargeType] = useState("Room Service");
    const [chargeDescription, setChargeDescription] = useState("");
    const [chargeAmount, setChargeAmount] = useState("");
    const [savingCharge, setSavingCharge] = useState(false);

    // Add Payment dialog state
    const [addPaymentOpen, setAddPaymentOpen] = useState(false);
    const [payMethod, setPayMethod] = useState("Cash");
    const [payAmount, setPayAmount] = useState("");
    const [payReference, setPayReference] = useState("");
    const [payNotes, setPayNotes] = useState("");
    const [savingPayment, setSavingPayment] = useState(false);

    // Resolve Incidental Deposit Dialog state
    const [resolveDepositOpen, setResolveDepositOpen] = useState(false);
    const [depositResolution, setDepositResolution] = useState<"Refund" | "Forfeit">("Refund");
    const [forfeitOption, setForfeitOption] = useState<"Full" | "Partial">("Full");
    const [forfeitAmount, setForfeitAmount] = useState<string>("1000");

    // Confirm Check-Out Dialog state
    const [confirmCheckoutOpen, setConfirmCheckoutOpen] = useState(false);

    const fetchFolio = useCallback(async () => {
        if (!reservationId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/hos/folio?reservationId=${reservationId}`);
            const result = await res.json();
            if (result.success && result.data) {
                setCharges(result.data.charges || []);
                setPayments(result.data.payments || []);
            }
        } catch {
            toast.error("Failed to load folio data.");
        } finally {
            setLoading(false);
        }
    }, [reservationId]);

    useEffect(() => {
        if (open && reservationId) {
            fetchFolio();
        }
    }, [open, reservationId, fetchFolio]);

    // Calculations
    const totalCharges = charges.reduce((sum, c) => sum + parseFloat(String(c.amount)), 0);
    const totalPayments = payments.reduce((sum, p) => sum + parseFloat(String(p.amount)), 0);
    const balance = totalCharges - totalPayments;
    const isBalanceClear = Math.abs(balance) < 0.01;
    const depositHoldPayment = payments.find(p => p.notes === "Incidental Deposit Hold");

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
            ", " +
            d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    };

    // Add Charge
    const handleAddCharge = async () => {
        if (!chargeDescription.trim() || !chargeAmount) {
            toast.error("Description and amount are required.");
            return;
        }
        setSavingCharge(true);
        try {
            const res = await fetch("/api/hos/folio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "charge",
                    reservationId,
                    charge_type: chargeType,
                    description: chargeDescription.trim(),
                    amount: parseFloat(chargeAmount),
                }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Charge added successfully.");
            setAddChargeOpen(false);
            setChargeDescription("");
            setChargeAmount("");
            setChargeType("Room Service");
            fetchFolio();
        } catch {
            toast.error("Failed to add charge.");
        } finally {
            setSavingCharge(false);
        }
    };

    // Add Payment
    const handleAddPayment = async () => {
        if (!payAmount) {
            toast.error("Amount is required.");
            return;
        }
        setSavingPayment(true);
        try {
            const res = await fetch("/api/hos/folio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "payment",
                    reservationId,
                    amount: parseFloat(payAmount),
                    payment_method: payMethod,
                    reference_number: payReference.trim() || undefined,
                    notes: payNotes.trim() || undefined,
                }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Payment recorded successfully.");
            setAddPaymentOpen(false);
            setPayAmount("");
            setPayReference("");
            setPayNotes("");
            setPayMethod("Cash");
            fetchFolio();
        } catch {
            toast.error("Failed to record payment.");
        } finally {
            setSavingPayment(false);
        }
    };

    const handleReturnDeposit = async (depPayment: PaymentItem) => {
        setLoading(true);
        try {
            const res = await fetch("/api/hos/folio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "payment",
                    reservationId,
                    amount: -parseFloat(String(depPayment.amount)),
                    payment_method: depPayment.payment_method,
                    notes: "Deposit Refunded",
                }),
            });
            if (!res.ok) throw new Error("Failed to refund");
            toast.success("Deposit returned successfully.");
            fetchFolio();
        } catch {
            toast.error("Failed to return deposit.");
        } finally {
            setLoading(false);
        }
    };

    const activeDeposit = payments.find(p => p.notes === "Incidental Deposit Hold" && !payments.some(refund => refund.notes === "Deposit Refunded"));

    // Check-out with balance protection and deposit resolution
    const handleFinalizeCheckout = async () => {
        if (!isBalanceClear) {
            toast.error("Outstanding balance must be ₱0.00 to finalize check-out.");
            return;
        }

        if (activeDeposit) {
            setForfeitAmount(activeDeposit.amount.toString());
            setResolveDepositOpen(true);
            return;
        }

        setConfirmCheckoutOpen(true);
    };

    const executeCheckout = async (
        depositId: number | null,
        resolution: "Refund" | "Forfeit" | null,
        refundVal: number,
        forfeitVal: number
    ) => {
        setCheckingOut(true);
        try {
            // We need roomId — fetch from reservation
            const folioRes = await fetch(`/api/hos/folio?reservationId=${reservationId}`);
            const folioResult = await folioRes.json();
            
            // Get room_id from the reservation's reservation_items
            const resItemsRes = await fetch(`/api/hos/front-desk-dashboard/check-out`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservationId,
                    roomId: roomId || folioResult.data?.reservation?.room_id || null,
                    depositId,
                    resolution,
                    refundAmount: refundVal,
                    forfeitAmount: forfeitVal,
                }),
            });

            if (!resItemsRes.ok) throw new Error("Check-out failed");

            toast.success(`${guestName} checked out successfully.`);
            setResolveDepositOpen(false);
            onOpenChange(false);
            onCheckOutSuccess();
        } catch {
            toast.error("Failed to finalize check-out.");
        } finally {
            setCheckingOut(false);
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="right"
                    className="sm:max-w-[520px] w-full flex flex-col p-0 gap-0"
                    showCloseButton={true}
                >
                    {/* Header */}
                    <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <SheetTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-muted-foreground" />
                                    Guest Folio
                                </SheetTitle>
                                <SheetDescription className="text-sm mt-1">
                                    {guestName} &bull; Room {roomNumber} ({roomTypeName})
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                {/* Outstanding Balance Banner */}
                                <div
                                    className={`rounded-xl p-4 border ${
                                        isBalanceClear
                                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                                            : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p
                                                className={`text-xs font-bold uppercase tracking-wider ${
                                                    isBalanceClear
                                                        ? "text-emerald-700 dark:text-emerald-400"
                                                        : "text-rose-700 dark:text-rose-400"
                                                }`}
                                            >
                                                {isBalanceClear ? "BALANCE CLEARED" : "OUTSTANDING BALANCE"}
                                            </p>
                                            <p
                                                className={`text-3xl font-extrabold mt-1 ${
                                                    isBalanceClear
                                                        ? "text-emerald-800 dark:text-emerald-300"
                                                        : "text-rose-800 dark:text-rose-300"
                                                }`}
                                            >
                                                ₱{Math.abs(balance).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs shadow-sm flex items-center gap-1.5"
                                            onClick={() => {
                                                setPayAmount(balance > 0 ? balance.toFixed(2) : "");
                                                setAddPaymentOpen(true);
                                            }}
                                        >
                                            <CreditCard className="h-3.5 w-3.5" />
                                            Add Payment
                                        </Button>
                                    </div>
                                </div>

                                {/* Account Ledger (Charges) */}
                                <div className="rounded-xl border border-muted/50 overflow-hidden">
                                    <div className="flex justify-between items-center px-4 py-2.5 bg-muted/30 border-b border-muted/50">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Account Ledger (Charges)
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs text-primary hover:text-primary/80 font-semibold px-2"
                                            onClick={() => setAddChargeOpen(true)}
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Charge
                                        </Button>
                                    </div>
                                    <div className="px-4 py-1.5 flex justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b bg-muted/10">
                                        <span>Date / Item</span>
                                        <span>Amount</span>
                                    </div>
                                    {charges.length === 0 && !depositHoldPayment ? (
                                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                                            No charges recorded.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-muted/30">
                                            {depositHoldPayment && (
                                                <div className="flex justify-between items-start px-4 py-3 bg-amber-500/[0.03] border-b border-muted/30">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                                            Initial Deposit
                                                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">(Refundable)</span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDate(depositHoldPayment.payment_date)}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-semibold text-foreground shrink-0">
                                                        ₱{parseFloat(String(depositHoldPayment.amount)).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            {charges.map((charge) => (
                                                <div
                                                    key={charge.id}
                                                    className="flex justify-between items-start px-4 py-3"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {charge.description}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDate(charge.charge_date)}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-semibold text-foreground shrink-0">
                                                        ₱{parseFloat(String(charge.amount)).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center px-4 py-2.5 bg-muted/30 border-t border-muted/50">
                                        <span className="text-xs font-bold text-muted-foreground">
                                            Total Charges:
                                        </span>
                                        <span className="text-sm font-bold text-foreground">
                                            ₱{totalCharges.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Payments Received */}
                                <div className="rounded-xl border border-muted/50 overflow-hidden">
                                    <div className="px-4 py-2.5 bg-muted/30 border-b border-muted/50">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Payments Received
                                        </p>
                                    </div>
                                    {payments.length === 0 ? (
                                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                                            No payments recorded.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-muted/30">
                                            {payments.map((payment) => (
                                                <div
                                                    key={payment.id}
                                                    className="flex justify-between items-start px-4 py-3"
                                                >
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="mt-0.5 p-1 rounded-md bg-muted/50">
                                                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">
                                                                {payment.notes === "Deposit Refunded" ? "Deposit Refunded" : `${payment.payment_method} Payment`}
                                                                {payment.notes === "Incidental Deposit Hold" && (
                                                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold ml-2">(Deposit Hold)</span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatDate(payment.payment_date)}
                                                                {payment.reference_number && (
                                                                    <> &bull; {payment.reference_number}</>
                                                                )}
                                                            </p>
                                                            {payment.notes === "Incidental Deposit Hold" && !payments.some(refund => refund.notes === "Deposit Refunded") && (
                                                                <Button
                                                                    variant="link"
                                                                    size="sm"
                                                                    className="h-auto p-0 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 mt-1 flex items-center gap-1"
                                                                    onClick={() => handleReturnDeposit(payment)}
                                                                >
                                                                    Return Deposit
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`text-sm font-semibold shrink-0 ${
                                                        parseFloat(String(payment.amount)) < 0
                                                            ? "text-rose-600 dark:text-rose-400"
                                                            : "text-emerald-600 dark:text-emerald-400"
                                                    }`}>
                                                        {parseFloat(String(payment.amount)) < 0 ? "-" : "+"} ₱{Math.abs(parseFloat(String(payment.amount))).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <SheetFooter className="px-6 py-4 border-t gap-2 shrink-0">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-xl border border-muted-foreground/20 hover:bg-muted/80 text-foreground"
                            onClick={() => onOpenChange(false)}
                        >
                            Close Folio
                        </Button>
                        <Button
                            className="flex-1 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={!isBalanceClear || checkingOut || loading}
                            onClick={handleFinalizeCheckout}
                        >
                            {checkingOut ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Finalize Check-Out"
                            )}
                        </Button>
                        {!isBalanceClear && !loading && (
                            <div className="w-full flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 mt-1">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                <span>Balance must be ₱0.00 to finalize check-out.</span>
                            </div>
                        )}
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Add Charge Dialog */}
            <Dialog open={addChargeOpen} onOpenChange={setAddChargeOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Add Charge</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Add an extra charge to {guestName}&apos;s folio.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Charge Type</Label>
                            <Select value={chargeType} onValueChange={setChargeType}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Room Service">Room Service</SelectItem>
                                    <SelectItem value="Minibar">Minibar</SelectItem>
                                    <SelectItem value="Spa">Spa</SelectItem>
                                    <SelectItem value="Late Checkout">Late Checkout Fee</SelectItem>
                                    <SelectItem value="Damage">Damage Fee</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Description</Label>
                            <Input
                                placeholder="e.g. Breakfast - Room Service"
                                value={chargeDescription}
                                onChange={(e) => setChargeDescription(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Amount (₱)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                value={chargeAmount}
                                onChange={(e) => setChargeAmount(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setAddChargeOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddCharge}
                            disabled={savingCharge}
                            className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold"
                        >
                            {savingCharge ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    Saving...
                                </>
                            ) : (
                                "Add Charge"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Payment Dialog */}
            <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Record Payment</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Log a payment received from {guestName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Payment Method</Label>
                            <Select value={payMethod} onValueChange={setPayMethod}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="GCash">GCash</SelectItem>
                                    <SelectItem value="PayMaya">PayMaya</SelectItem>
                                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Amount (₱)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">
                                Reference Number <span className="text-muted-foreground font-normal">(Optional)</span>
                            </Label>
                            <Input
                                placeholder="e.g. GC-998877"
                                value={payReference}
                                onChange={(e) => setPayReference(e.target.value)}
                                className="rounded-xl font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">
                                Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                            </Label>
                            <Input
                                placeholder="Any notes..."
                                value={payNotes}
                                onChange={(e) => setPayNotes(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setAddPaymentOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddPayment}
                            disabled={savingPayment}
                            className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold"
                        >
                            {savingPayment ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    Saving...
                                </>
                            ) : (
                                "Record Payment"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Resolve Incidental Deposit Dialog */}
            <Dialog open={resolveDepositOpen} onOpenChange={setResolveDepositOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Resolve Incidental Deposit</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Resolve the incidental deposit hold of ₱{activeDeposit?.amount || "0.00"} for {guestName}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Resolution</Label>
                            <Select 
                                value={depositResolution} 
                                onValueChange={(val: "Refund" | "Forfeit") => setDepositResolution(val)}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Refund">Refund Full Deposit</SelectItem>
                                    <SelectItem value="Forfeit">Forfeit (Damage/Fees)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {depositResolution === "Forfeit" && (
                            <>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold">Forfeit Option</Label>
                                    <Select 
                                        value={forfeitOption} 
                                        onValueChange={(val: "Full" | "Partial") => {
                                            setForfeitOption(val);
                                            if (val === "Full" && activeDeposit) {
                                                setForfeitAmount(activeDeposit.amount.toString());
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full">Forfeit Full (₱{activeDeposit?.amount || "0.00"})</SelectItem>
                                            <SelectItem value="Partial">Forfeit Partial Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {forfeitOption === "Partial" && (
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold">Forfeit Amount (₱)</Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            min="0"
                                            max={activeDeposit?.amount || 0}
                                            step="0.01"
                                            value={forfeitAmount}
                                            onChange={(e) => setForfeitAmount(e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            variant="outline" 
                            onClick={() => setResolveDepositOpen(false)} 
                            className="rounded-xl"
                            disabled={checkingOut}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (!activeDeposit) return;
                                const fAmt = depositResolution === "Refund" 
                                    ? 0 
                                    : parseFloat(forfeitAmount || "0");
                                const rAmt = depositResolution === "Refund" 
                                    ? activeDeposit.amount 
                                    : activeDeposit.amount - fAmt;
                                
                                if (fAmt > activeDeposit.amount || fAmt < 0) {
                                    toast.error("Forfeit amount must be between ₱0.00 and the full deposit amount.");
                                    return;
                                }

                                executeCheckout(activeDeposit.id, depositResolution, rAmt, fAmt);
                            }}
                            disabled={checkingOut}
                            className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold"
                        >
                            {checkingOut ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    Processing...
                                </>
                            ) : (
                                "Complete Check-Out"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Check-Out Dialog */}
            <Dialog open={confirmCheckoutOpen} onOpenChange={setConfirmCheckoutOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Finalize Check-Out</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-1">
                            Are you sure you want to finalize the check-out for <span className="font-semibold">{guestName}</span> from Room <span className="font-semibold">{roomNumber}</span>?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setConfirmCheckoutOpen(false)} 
                            className="rounded-xl"
                            disabled={checkingOut}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                await executeCheckout(null, null, 0, 0);
                                setConfirmCheckoutOpen(false);
                            }}
                            disabled={checkingOut}
                            className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold"
                        >
                            {checkingOut ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    Processing...
                                </>
                            ) : (
                                "Confirm Check-Out"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
