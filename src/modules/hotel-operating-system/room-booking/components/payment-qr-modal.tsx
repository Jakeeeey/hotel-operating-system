"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Check, QrCode, Loader2, Smartphone } from "lucide-react";

interface PaymentQrModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingData: {
        reservationId: number;
        guestName: string;
        roomTypeName: string;
        roomNumber: string;
        nights: number;
        basePrice: number;
        totalAmount: number;
        paymentMethod: string;
        paymentAmount: number;
    };
    onPaymentComplete: () => void;
}

export function PaymentQrModal({ open, onOpenChange, bookingData, onPaymentComplete }: PaymentQrModalProps) {
    const [referenceNumber, setReferenceNumber] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);

    const remainingBalance = bookingData.totalAmount - bookingData.paymentAmount;

    const handleVerifyPayment = async () => {
        if (!referenceNumber.trim()) {
            return;
        }

        setVerifying(true);
        try {
            const res = await fetch("/api/hos/folio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "payment",
                    reservationId: bookingData.reservationId,
                    amount: bookingData.paymentAmount,
                    payment_method: bookingData.paymentMethod,
                    reference_number: referenceNumber.trim(),
                    notes: `Payment collected at booking via ${bookingData.paymentMethod}`,
                }),
            });

            if (!res.ok) throw new Error("Failed to record payment");

            setVerified(true);

            // Show success animation for 2 seconds then complete
            setTimeout(() => {
                setVerified(false);
                setReferenceNumber("");
                onPaymentComplete();
            }, 2000);
        } catch {
            setVerifying(false);
        }
    };

    const handleSkipPayment = () => {
        setReferenceNumber("");
        setVerified(false);
        onPaymentComplete();
    };

    // Generate a mock QR code pattern using SVG
    const MockQrCode = () => {
        const size = 200;
        const cellSize = 8;
        const cells = size / cellSize;
        // Deterministic pattern based on reservation data
        const seed = bookingData.reservationId + bookingData.paymentAmount;

        const rects = [];
        for (let y = 0; y < cells; y++) {
            for (let x = 0; x < cells; x++) {
                // Create finder patterns (top-left, top-right, bottom-left)
                const isFinderArea =
                    (x < 7 && y < 7) ||
                    (x >= cells - 7 && y < 7) ||
                    (x < 7 && y >= cells - 7);

                const isFinderBorder =
                    isFinderArea &&
                    (x === 0 || x === 6 || y === 0 || y === 6 ||
                        x === cells - 7 || x === cells - 1 ||
                        y === cells - 7 || y === cells - 1);

                const isFinderInner =
                    isFinderArea &&
                    ((x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
                        (x >= cells - 5 && x <= cells - 3 && y >= 2 && y <= 4) ||
                        (x >= 2 && x <= 4 && y >= cells - 5 && y <= cells - 3));

                let fill = false;
                if (isFinderBorder || isFinderInner) {
                    fill = true;
                } else if (!isFinderArea) {
                    // Pseudo-random fill for data area
                    const hash = ((x * 31 + y * 17 + seed * 7) % 100);
                    fill = hash < 40;
                }

                if (fill) {
                    rects.push(
                        <rect
                            key={`${x}-${y}`}
                            x={x * cellSize}
                            y={y * cellSize}
                            width={cellSize}
                            height={cellSize}
                            rx={1}
                            className="fill-foreground"
                        />
                    );
                }
            }
        }

        return (
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
                {rects}
            </svg>
        );
    };

    const getPaymentMethodColor = () => {
        switch (bookingData.paymentMethod) {
            case "GCash": return "from-blue-600 to-blue-500";
            case "PayMaya": return "from-green-600 to-green-500";
            case "Credit Card": return "from-violet-600 to-violet-500";
            default: return "from-gray-600 to-gray-500";
        }
    };

    return (
        <Dialog open={open} onOpenChange={verified ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-[720px] border-none shadow-2xl bg-background rounded-2xl overflow-hidden p-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>Payment Verification</DialogTitle>
                    <DialogDescription>Verify payment for reservation</DialogDescription>
                </DialogHeader>

                {/* Success overlay */}
                {verified && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="text-center space-y-4 animate-in zoom-in-50 duration-500">
                            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-0 duration-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-bold text-foreground">Payment Verified!</p>
                                <p className="text-sm text-muted-foreground">
                                    ₱{bookingData.paymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} received via {bookingData.paymentMethod}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                    {/* Left: Breakdown */}
                    <div className="p-6 space-y-5 border-r border-muted/60">
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                Reservation Breakdown
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {bookingData.guestName} &bull; {bookingData.roomTypeName}
                                {bookingData.roomNumber && ` &bull; Room ${bookingData.roomNumber}`}
                            </p>
                        </div>

                        {/* Charges */}
                        <div className="bg-muted/30 rounded-xl border border-muted/50 overflow-hidden">
                            <div className="px-4 py-2.5 bg-muted/40 border-b border-muted/50">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Ledger</p>
                            </div>
                            <div className="divide-y divide-muted/40">
                                <div className="flex justify-between items-center px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Base Room Charge</p>
                                        <p className="text-xs text-muted-foreground">
                                            ₱{bookingData.basePrice.toLocaleString()} × {bookingData.nights} {bookingData.nights === 1 ? "night" : "nights"}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">
                                        ₱{bookingData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center px-4 py-2.5 bg-muted/40 border-t border-muted/50">
                                <span className="text-xs font-bold text-muted-foreground">Total Charges</span>
                                <span className="text-sm font-bold text-foreground">
                                    ₱{bookingData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Amount to Pay Now</span>
                                <span className="font-semibold text-foreground">
                                    ₱{bookingData.paymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            {remainingBalance > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Remaining Balance</span>
                                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                                        ₱{remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Method badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getPaymentMethodColor()}`}>
                            <Smartphone className="h-3.5 w-3.5" />
                            {bookingData.paymentMethod}
                        </div>
                    </div>

                    {/* Right: QR Code + Verification */}
                    <div className="p-6 flex flex-col items-center justify-between gap-5 bg-muted/10">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <QrCode className="h-3.5 w-3.5" />
                                Scan to Pay
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Guest scans this QR code with their {bookingData.paymentMethod} app
                            </p>
                        </div>

                        {/* QR Code */}
                        <div className="w-44 h-44 p-3 bg-white rounded-2xl shadow-lg border border-muted/30">
                            <MockQrCode />
                        </div>

                        {/* Reference Input + Verify */}
                        <div className="w-full space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="qr-ref" className="text-xs font-semibold text-muted-foreground">
                                    Enter Payment Reference Number
                                </Label>
                                <Input
                                    id="qr-ref"
                                    placeholder="e.g. GC-998877"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    className="rounded-xl border border-muted-foreground/20 text-center font-mono text-sm"
                                    disabled={verifying || verified}
                                />
                                <p className="text-[10px] text-muted-foreground text-center italic">
                                    Read the reference code from the guest&apos;s payment confirmation screen
                                </p>
                            </div>

                            <Button
                                onClick={handleVerifyPayment}
                                disabled={!referenceNumber.trim() || verifying || verified}
                                className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold py-5 text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-md"
                            >
                                {verifying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Verifying Payment...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Verify &amp; Complete Payment
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleSkipPayment}
                                disabled={verifying || verified}
                                className="w-full text-xs text-muted-foreground hover:text-foreground"
                            >
                                Skip — Record payment later
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
