"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Reservation } from "./guest-history-modal";
import { differenceInDays, parseISO } from "date-fns";
import { ArrowRight, CalendarDays, BedDouble, CircleDollarSign, PhilippinePeso } from "lucide-react";

interface Room {
    id: number;
    room_number: string;
    type_id: {
        id: number;
        name: string;
        price: number;
    };
    operational_status_id?: number;
    housekeeping_status_id?: number;
}

interface ManageStayModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: Reservation | null;
    onSuccess: () => void;
}

export function ManageStayModal({ open, onOpenChange, reservation, onSuccess }: ManageStayModalProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial / Original Data
    const originalRoomId = (reservation?.reservation_items?.[0]?.room_id as any)?.id;
    const originalCheckIn = reservation?.check_in ? reservation.check_in.substring(0, 10) : "";
    const originalCheckOut = reservation?.check_out ? reservation.check_out.substring(0, 10) : "";

    // Editable State
    const [selectedRoomId, setSelectedRoomId] = useState<number | "">("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [overrideAmount, setOverrideAmount] = useState<string>("");

    useEffect(() => {
        if (open) {
            fetchRooms();
            setCheckOutDate(originalCheckOut);
            setSelectedRoomId(originalRoomId || "");
            setOverrideAmount("");
        }
    }, [open, reservation, originalCheckOut, originalRoomId]);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/hos/master-guest-list/rooms-with-types');
            if (res.ok) {
                const data = await res.json();
                setRooms(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch rooms", error);
        } finally {
            setLoading(false);
        }
    };

    // Derived values for UI comparison
    const originalRoom = useMemo(() => rooms.find(r => r.id === originalRoomId), [rooms, originalRoomId]);
    const newRoom = useMemo(() => rooms.find(r => r.id === selectedRoomId), [rooms, selectedRoomId]);

    const originalNights = useMemo(() => {
        try { return Math.max(0, differenceInDays(parseISO(originalCheckOut), parseISO(originalCheckIn))); }
        catch { return 0; }
    }, [originalCheckIn, originalCheckOut]);

    const newNights = useMemo(() => {
        if (!checkOutDate) return null;
        try { 
            const days = differenceInDays(parseISO(checkOutDate), parseISO(originalCheckIn));
            return isNaN(days) ? null : Math.max(0, days);
        } catch { return null; }
    }, [originalCheckIn, checkOutDate]);

    // Live Calculation for preview
    const estimatedAdjustment = useMemo(() => {
        if (!originalRoom || !newRoom || newNights === null) return null;
        const oldPrice = parseFloat(originalRoom.type_id?.price as any) || 0;
        const newPrice = parseFloat(newRoom.type_id?.price as any) || 0;

        const priceDiffPerNight = newPrice - oldPrice;
        let adj = 0;

        // If room is the same
        if (originalRoom.id === newRoom.id) {
            if (newNights !== originalNights) {
                adj = (newNights - originalNights) * oldPrice;
            }
        } else {
            // Room changed - apply diff to all nights, plus new rate for extra nights
            adj = newNights * priceDiffPerNight;
            if (newNights !== originalNights) {
                adj += (newNights - originalNights) * newPrice;
            }
        }
        return adj;
    }, [originalRoom, newRoom, originalNights, newNights]);

    const isRoomChanged = selectedRoomId !== originalRoomId;
    const isDateChanged = checkOutDate !== originalCheckOut;
    const isModified = isRoomChanged || isDateChanged;

    const handleSave = async () => {
        if (!reservation || !selectedRoomId || !checkOutDate || newNights === null) {
            toast.error("Please fill in all required fields with valid values.");
            return;
        }
        if (!isModified) {
            onOpenChange(false);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                reservation_id: reservation.id,
                new_room_id: Number(selectedRoomId),
                new_check_out: checkOutDate,
                override_amount: overrideAmount !== "" ? Number(overrideAmount) : null
            };

            const res = await fetch("/api/hos/reservations/update-stay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update stay");

            const adj = data.adjustment || 0;
            if (adj > 0) {
                toast.success(`Stay updated. Additional charge of $${adj.toFixed(2)} added to folio.`);
            } else if (adj < 0) {
                toast.success(`Stay updated. Credit of $${Math.abs(adj).toFixed(2)} added to folio.`);
            } else {
                toast.success("Stay updated successfully.");
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (!reservation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b shrink-0 bg-background">
                    <DialogTitle className="text-2xl font-bold">Manage Stay</DialogTitle>
                    <DialogDescription>
                        Compare current reservation details and modify room assignment or checkout date.
                    </DialogDescription>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 min-h-full">
                        {/* LEFT COLUMN: Read Only */}
                        <div className="bg-muted/30 p-6 md:border-r border-b md:border-b-0 space-y-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                <div className="h-2 w-2 rounded-full bg-primary/40"></div>
                                <h3 className="font-semibold uppercase tracking-wider text-sm">Current Stay Details</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs">Current Room</Label>
                                    <div className="mt-1 flex items-center gap-2 p-3 bg-background border rounded-lg">
                                        <BedDouble className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Room {originalRoom?.room_number || "..."}</p>
                                            <p className="text-sm text-muted-foreground">{originalRoom?.type_id?.name || "..."}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-muted-foreground text-xs">Current Dates</Label>
                                    <div className="mt-1 flex items-center gap-4 p-3 bg-background border rounded-lg">
                                        <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm"><span className="text-muted-foreground inline-block w-12">In:</span> <span className="font-medium">{originalCheckIn}</span></p>
                                            <p className="text-sm"><span className="text-muted-foreground inline-block w-12">Out:</span> <span className="font-medium">{originalCheckOut}</span></p>
                                        </div>
                                        <div className="text-right text-sm font-medium text-muted-foreground border-l pl-3">
                                            {originalNights} Nights
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-muted-foreground text-xs">Nightly Rate</Label>
                                    <div className="mt-1 flex items-center gap-2 p-3 bg-background border rounded-lg">
                                        <PhilippinePeso className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium">{parseFloat(originalRoom?.type_id?.price as any || 0).toFixed(2)}</span>
                                        <span className="text-sm text-muted-foreground">/ night</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Interactive */}
                        <div className="p-6 space-y-6 bg-background">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                    <h3 className="font-semibold uppercase tracking-wider text-sm">Modifications</h3>
                                </div>
                                {isModified && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold border border-amber-500/20">
                                        Changes pending
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className={`p-4 border rounded-xl transition-colors ${isRoomChanged ? 'bg-primary/5 border-primary/20' : 'bg-transparent'}`}>
                                    <Label className="font-medium mb-2 block">New Room Selection</Label>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                                        value={selectedRoomId}
                                        onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                                    >
                                        <option value="">Select a room...</option>
                                        {rooms.filter(r => r.id === originalRoomId || (r.operational_status_id === 1 && r.housekeeping_status_id === 1)).map((r) => (
                                            <option key={r.id} value={r.id}>
                                                Room {r.room_number} ({r.type_id?.name} - ${r.type_id?.price})
                                            </option>
                                        ))}
                                    </select>
                                    {isRoomChanged && (
                                        <p className="text-xs text-primary mt-2 flex items-center gap-1">
                                            <ArrowRight className="h-3 w-3" /> Room changed from {originalRoom?.room_number}
                                        </p>
                                    )}
                                </div>

                                <div className={`p-4 border rounded-xl transition-colors ${isDateChanged ? 'bg-primary/5 border-primary/20' : 'bg-transparent'}`}>
                                    <Label className="font-medium mb-2 block">New Checkout Date</Label>
                                    <Input
                                        type="date"
                                        value={checkOutDate}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCheckOutDate(val ? val : originalCheckOut);
                                        }}
                                        min={originalCheckIn} // cannot checkout before checkin
                                    />
                                    {isDateChanged && newNights !== null && (
                                        <p className="text-xs text-primary mt-2 flex items-center justify-between">
                                            <span className="flex items-center gap-1">
                                                <ArrowRight className="h-3 w-3" /> Date changed
                                            </span>
                                            <span className="font-semibold">{newNights} Nights Total</span>
                                        </p>
                                    )}
                                    {isDateChanged && newNights === null && (
                                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                                            Invalid date selected
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM FOOTER: Financials & Actions */}
                <div className="p-6 border-t bg-muted/10 shrink-0">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">Estimated Adjustment:</span>
                                {estimatedAdjustment === null ? (
                                    <span className="text-muted-foreground font-medium text-lg">Invalid Selection</span>
                                ) : estimatedAdjustment > 0 ? (
                                    <span className="text-destructive font-bold text-lg">+${estimatedAdjustment.toFixed(2)} (Additional Charge)</span>
                                ) : estimatedAdjustment < 0 ? (
                                    <span className="text-emerald-600 font-bold text-lg">-${Math.abs(estimatedAdjustment).toFixed(2)} (Refund Due)</span>
                                ) : (
                                    <span className="text-muted-foreground font-medium text-lg">$0.00 (No Change)</span>
                                )}
                            </div>
                            <div className="max-w-xs">
                                <Label className="text-xs text-muted-foreground mb-1 block">Manual Override (Optional)</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-sm"
                                    placeholder="Enter final charge/credit amount"
                                    value={overrideAmount}
                                    onChange={(e) => setOverrideAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 shrink-0">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={saving || loading || !isModified || !selectedRoomId || !checkOutDate || newNights === null}>
                                {saving ? "Saving..." : isModified ? "Confirm Changes" : "No Changes Made"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
