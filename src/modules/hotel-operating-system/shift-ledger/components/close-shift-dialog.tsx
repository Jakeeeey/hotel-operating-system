"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface CloseShiftDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shiftId: number | null;
    expectedCash: number;
    onSuccess: () => void;
}

export function CloseShiftDialog({
    open,
    onOpenChange,
    shiftId,
    expectedCash,
    onSuccess,
}: CloseShiftDialogProps) {
    const [actualCash, setActualCash] = useState("");
    const [loading, setLoading] = useState(false);

    // Mismatch override state
    const [showOverride, setShowOverride] = useState(false);
    const [overridePin, setOverridePin] = useState("");
    const [resolutionNotes, setResolutionNotes] = useState("");

    const fmtCurrency = (n: number) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(n);

    const handleClose = async () => {
        const counted = parseFloat(actualCash);
        if (isNaN(counted) || counted < 0) {
            toast.error("Please enter a valid cash count.");
            return;
        }

        const variance = Math.round((counted - expectedCash) * 100) / 100;

        // If mismatch and override not confirmed yet
        if (variance !== 0 && !showOverride) {
            setShowOverride(true);
            return;
        }

        // If mismatch, validate the admin override PIN
        if (variance !== 0 && showOverride) {
            if (overridePin !== "1234") {
                toast.error("Invalid Manager PIN. Please try again.");
                return;
            }
            if (!resolutionNotes.trim()) {
                toast.error("Resolution notes are required for variance overrides.");
                return;
            }
        }

        setLoading(true);
        try {
            const payload: Record<string, unknown> = {
                action: "close",
                shiftId,
                actual_cash: counted,
                expected_cash: expectedCash,
            };

            if (variance !== 0) {
                payload.resolved_by = "Manager Override";
                payload.resolution_notes = resolutionNotes;
            }

            const res = await fetch("/api/hos/shift-ledger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (!res.ok) {
                toast.error(result.error || "Failed to close shift.");
                return;
            }

            toast.success("Shift closed successfully!");
            resetState();
            onOpenChange(false);
            onSuccess();
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setActualCash("");
        setShowOverride(false);
        setOverridePin("");
        setResolutionNotes("");
    };

    const counted = parseFloat(actualCash) || 0;
    const variance = Math.round((counted - expectedCash) * 100) / 100;

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) resetState();
                onOpenChange(v);
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Close Shift — Blind Count</DialogTitle>
                    <DialogDescription>
                        Count the physical cash in the drawer and enter the total below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Expected cash (read-only) */}
                    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">
                            System Expected Cash
                        </p>
                        <p className="text-xl font-bold tracking-tight">
                            {fmtCurrency(expectedCash)}
                        </p>
                    </div>

                    {/* Actual cash input */}
                    <div className="space-y-2">
                        <Label htmlFor="actual-cash">Actual Cash Count (₱)</Label>
                        <Input
                            id="actual-cash"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={actualCash}
                            onChange={(e) => {
                                setActualCash(e.target.value);
                                setShowOverride(false);
                            }}
                            disabled={loading}
                        />
                    </div>

                    {/* Variance indicator */}
                    {actualCash && (
                        <div
                            className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${
                                variance === 0
                                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                                    : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                            }`}
                        >
                            {variance === 0 ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Cash count matches expected amount.
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-4 w-4" />
                                    Variance: {fmtCurrency(variance)} (
                                    {variance > 0 ? "Over" : "Short"})
                                </>
                            )}
                        </div>
                    )}

                    {/* Manager Override Section */}
                    {showOverride && (
                        <div className="space-y-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 p-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    Manager Override Required
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Cash count does not match. A Manager PIN is required to
                                proceed.
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="override-pin">Manager PIN</Label>
                                <Input
                                    id="override-pin"
                                    type="password"
                                    maxLength={6}
                                    placeholder="Enter PIN"
                                    value={overridePin}
                                    onChange={(e) => setOverridePin(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="resolution-notes">
                                    Resolution Notes
                                </Label>
                                <Textarea
                                    id="resolution-notes"
                                    placeholder="Explain the variance..."
                                    value={resolutionNotes}
                                    onChange={(e) =>
                                        setResolutionNotes(e.target.value)
                                    }
                                    disabled={loading}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            resetState();
                            onOpenChange(false);
                        }}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleClose}
                        disabled={loading || !actualCash}
                        variant={showOverride ? "destructive" : "default"}
                    >
                        {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {showOverride ? "Confirm Override & Close" : "Close Shift"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
