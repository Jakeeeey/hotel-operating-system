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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OpenShiftDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function OpenShiftDialog({
    open,
    onOpenChange,
    onSuccess,
}: OpenShiftDialogProps) {
    const [startingCash, setStartingCash] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        const amount = parseFloat(startingCash);
        if (isNaN(amount) || amount < 0) {
            toast.error("Please enter a valid starting cash amount.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/hos/shift-ledger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "open",
                    starting_cash: amount,
                }),
            });

            const result = await res.json();
            if (!res.ok) {
                toast.error(result.error || "Failed to open shift.");
                return;
            }

            toast.success("Shift opened successfully!");
            setStartingCash("");
            onOpenChange(false);
            onSuccess();
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Open New Shift</DialogTitle>
                    <DialogDescription>
                        Enter the physical cash drawer float to begin a new shift.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="starting-cash">Starting Cash (₱)</Label>
                        <Input
                            id="starting-cash"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={startingCash}
                            onChange={(e) => setStartingCash(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleOpen} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Open Shift
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
