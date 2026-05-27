"use client";

import { useEffect, useState, useDeferredValue } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertTriangle, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface DepartureItem {
    reservationId: number;
    guestName: string;
    roomNumber: string;
    roomId: number | null;
    roomTypeName: string;
    status: string;
}

interface ExtendStayDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    departure: DepartureItem | null;
    onSuccess: () => void;
}

interface ExtensionCheckData {
    reservationId: number;
    guestName: string;
    currentRoomNumber: string;
    currentRoomId: number | null;
    roomTypeName: string;
    roomTypeId: number;
    lockedPrice: number;
    nightsToAdd: number;
    totalExtensionCost: number;
    currentRoomConflict: boolean;
    alternativeRooms: { id: number; room_number: string }[];
}

export function ExtendStayDialog({ open, onOpenChange, departure, onSuccess }: ExtendStayDialogProps) {
    const [newCheckOutDate, setNewCheckOutDate] = useState<string>("");
    const [checking, setChecking] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [checkData, setCheckData] = useState<ExtensionCheckData | null>(null);
    
    const [selectedRoomId, setSelectedRoomId] = useState<string>("");

    // Minimum checkout date is tomorrow or the day after today
    const [minDate, setMinDate] = useState<string>("");

    useEffect(() => {
        if (!open || !departure) return;

        // Fetch original check_out_date and details
        setChecking(true);
        setCheckData(null);
        setSelectedRoomId("");

        const fetchDetails = async () => {
            try {
                // Get the current reservation to get the min date
                const res = await fetch(`/api/hos/front-desk-dashboard`);
                const result = await res.json();
                
                // Let's find this reservation checkout date or default to tomorrow
                const today = new Date();
                const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                const tomorrowStr = tomorrow.toISOString().split("T")[0];
                setMinDate(tomorrowStr);
                setNewCheckOutDate(tomorrowStr);
            } catch {
                toast.error("Failed to load reservation details.");
            } finally {
                setChecking(false);
            }
        };

        fetchDetails();
    }, [open, departure]);

    // Handle check checkout dates availability
    const checkAvailability = async (dateVal: string) => {
        if (!departure || !dateVal) return;
        setChecking(true);
        try {
            const res = await fetch(
                `/api/hos/front-desk-dashboard/extend-stay?reservationId=${departure.reservationId}&newCheckOutDate=${dateVal}`
            );
            const result = await res.json();
            if (res.ok && result.data) {
                setCheckData(result.data);
                setSelectedRoomId(""); // Reset room move choice
            } else {
                toast.error(result.error || "Failed to check room availability.");
                setCheckData(null);
            }
        } catch {
            toast.error("Error verifying room availability.");
            setCheckData(null);
        } finally {
            setChecking(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNewCheckOutDate(val);
        if (val) {
            checkAvailability(val);
        }
    };

    const handleExtend = async () => {
        if (!departure || !newCheckOutDate) return;

        // If there's a conflict and they haven't assigned a room move
        if (checkData?.currentRoomConflict && !selectedRoomId) {
            toast.error("Please select a room to move the guest to.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/hos/front-desk-dashboard/extend-stay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservationId: departure.reservationId,
                    newCheckOutDate,
                    newRoomId: selectedRoomId ? parseInt(selectedRoomId, 10) : undefined,
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Stay extension failed.");

            toast.success(
                selectedRoomId
                    ? `${departure.guestName}'s stay extended to ${newCheckOutDate} (Room Move to Room ${
                          checkData?.alternativeRooms.find((r) => r.id.toString() === selectedRoomId)?.room_number || ""
                      })`
                    : `${departure.guestName}'s stay extended successfully to ${newCheckOutDate}!`
            );
            onOpenChange(false);
            onSuccess();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to extend stay.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!departure) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] rounded-3xl border border-muted-foreground/10 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden p-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        Extend Stay
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Extend reservation stay for <span className="font-semibold text-foreground">{departure.guestName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Guest & Room Details Grid */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-muted/50 text-sm">
                        <div>
                            <span className="text-xs text-muted-foreground block mb-0.5">Current Room</span>
                            <span className="font-semibold text-foreground">Room {departure.roomNumber}</span>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block mb-0.5">Room Type</span>
                            <span className="font-medium text-foreground">{departure.roomTypeName}</span>
                        </div>
                    </div>

                    {/* Check-Out Date Input */}
                    <div className="space-y-1.5">
                        <Label htmlFor="newCheckOutDate" className="text-sm font-semibold">New Check-Out Date</Label>
                        <Input
                            id="newCheckOutDate"
                            type="date"
                            min={minDate}
                            value={newCheckOutDate}
                            onChange={handleDateChange}
                            className="rounded-xl border border-muted-foreground/20 font-medium"
                        />
                    </div>

                    {/* Loader */}
                    {checking && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            Checking availability & calculating pricing...
                        </div>
                    )}

                    {/* Results & Pricing Block */}
                    {!checking && checkData && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Scenario A: No Conflict */}
                            {!checkData.currentRoomConflict ? (
                                <div className="flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
                                    <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>
                                        **Room {checkData.currentRoomNumber}** is available! The guest can stay in their current room for the entire extended stay.
                                    </span>
                                </div>
                            ) : (
                                /* Scenario B: Room Move Required */
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-400 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
                                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                        <span>
                                            **Room {checkData.currentRoomNumber}** is booked during these dates. A **Room Move** is required.
                                        </span>
                                    </div>

                                    {checkData.alternativeRooms.length === 0 ? (
                                        <div className="flex items-start gap-2 text-xs text-red-800 dark:text-red-400 bg-red-500/10 p-3.5 rounded-xl border border-red-500/20">
                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span>No alternative rooms of this type are available for the entire extension period.</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5 bg-muted/40 p-4 rounded-2xl border border-muted/50">
                                            <Label className="text-xs font-bold text-foreground">Select New Room (Move to Room)</Label>
                                            <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                                                <SelectTrigger className="rounded-xl border border-muted-foreground/20 bg-background">
                                                    <SelectValue placeholder="Select alternative room..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {checkData.alternativeRooms.map((room) => (
                                                        <SelectItem key={room.id} value={room.id.toString()}>
                                                            Room {room.room_number}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pricing breakdown details */}
                            <div className="bg-muted/30 border rounded-2xl p-4 space-y-2 text-xs">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Rate per night:</span>
                                    <span className="font-semibold text-foreground">₱{checkData.lockedPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Nights to Add:</span>
                                    <span className="font-semibold text-foreground">{checkData.nightsToAdd} night(s)</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-foreground pt-2 border-t">
                                    <span>Additional Cost:</span>
                                    <span className="text-primary font-extrabold text-base">₱{checkData.totalExtensionCost.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                        className="rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExtend}
                        disabled={
                            submitting || 
                            checking || 
                            !newCheckOutDate || 
                            !checkData || 
                            (checkData.currentRoomConflict && !selectedRoomId) ||
                            (checkData.currentRoomConflict && checkData.alternativeRooms.length === 0)
                        }
                        className="rounded-xl"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Confirm Stay Extension"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
