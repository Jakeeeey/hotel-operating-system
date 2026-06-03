"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface ArrivalItem {
    reservationId: number;
    guestName: string;
    roomTypeName: string;
    roomTypeId: number | null;
    status: string;
    roomId: number | null;
    roomNumber: string | null;
    roomHousekeepingStatusId?: number | null;
}

interface AvailableRoom {
    id: number;
    room_number: string;
    floor_number: number | null;
}

interface CheckInDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    arrival: ArrivalItem | null;
    onSuccess: () => void;
}

export function CheckInDialog({ open, onOpenChange, arrival, onSuccess }: CheckInDialogProps) {
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string>("");
    const [depositAmount, setDepositAmount] = useState<string>("1000");
    const [depositMethod, setDepositMethod] = useState<string>("Cash");
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Determine if room is already assigned
    const hasRoom = arrival?.roomId != null;

    // Early Check-In / Dirty Room Mandate check
    const isRoomDirty = hasRoom && arrival?.roomHousekeepingStatusId != null && arrival.roomHousekeepingStatusId !== 1;

    useEffect(() => {
        if (!open || !arrival) return;

        if (hasRoom) {
            // Room already assigned — pre-select it
            setSelectedRoomId(arrival.roomId!.toString());
            setAvailableRooms([]);
            return;
        }

        // Fetch available rooms for assignment
        if (arrival.roomTypeId) {
            setLoadingRooms(true);
            fetch(`/api/hos/front-desk-dashboard/available-rooms?roomTypeId=${arrival.roomTypeId}`)
                .then((res) => res.json())
                .then((data) => {
                    setAvailableRooms(data.data || []);
                    setSelectedRoomId("");
                })
                .catch(() => {
                    toast.error("Failed to load available rooms.");
                    setAvailableRooms([]);
                })
                .finally(() => setLoadingRooms(false));
        }
    }, [open, arrival, hasRoom]);

    const handleCheckIn = async () => {
        if (!arrival) return;

        const roomId = hasRoom ? arrival.roomId : parseInt(selectedRoomId, 10);
        if (!roomId) {
            toast.error("Please select a room.");
            return;
        }

        if (isRoomDirty) {
            toast.error("Room not ready. Reassign room or await Housekeeping clearance.");
            return;
        }

        if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
            toast.error("Please enter a valid deposit amount.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/hos/front-desk-dashboard/check-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservationId: arrival.reservationId,
                    roomId,
                    depositAmount: parseFloat(depositAmount),
                    depositMethod,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Check-in failed");
            }

            toast.success(`${arrival.guestName} checked in successfully.`);
            onOpenChange(false);
            onSuccess();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to check in guest.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!arrival) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>Check-In Guest</DialogTitle>
                    <DialogDescription>
                        Confirm check-in for <span className="font-semibold">{arrival.guestName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Hard Stop Alert if room is dirty */}
                    {isRoomDirty && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex gap-2.5 items-start text-xs text-destructive">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                            <div>
                                <p className="font-bold">Early Check-In Hard Stop</p>
                                <p className="mt-0.5 leading-normal">Room not ready. Reassign room or await Housekeeping clearance.</p>
                            </div>
                        </div>
                    )}

                    {/* Guest Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Guest</p>
                            <p className="text-sm font-semibold">{arrival.guestName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Room Type</p>
                            <p className="text-sm">{arrival.roomTypeName}</p>
                        </div>
                    </div>

                    {/* Room Assignment */}
                    {hasRoom ? (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Assigned Room</p>
                            <p className="text-sm font-semibold">Room {arrival.roomNumber}</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">
                                Assign Room <span className="text-destructive">*</span>
                            </p>
                            {loadingRooms ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading available rooms...
                                </div>
                            ) : availableRooms.length === 0 ? (
                                <p className="text-sm text-destructive font-semibold">
                                    No available rooms for this type. Please clean or vacate a room first.
                                </p>
                            ) : (
                                <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a room..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                Room {room.room_number}
                                                {room.floor_number != null && ` (Floor ${room.floor_number})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}

                    {/* Incidental Deposit Section */}
                    <div className="border-t pt-4 space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Incidental Deposit Mandate
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Deposit Method</Label>
                                <Select value={depositMethod} onValueChange={setDepositMethod}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Card Auth">Card Auth</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Deposit Amount (₱)</Label>
                                <Input
                                    type="number"
                                    placeholder="1000.00"
                                    min="0"
                                    step="0.01"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="h-9 font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCheckIn}
                        disabled={submitting || (!hasRoom && !selectedRoomId) || isRoomDirty}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Checking In...
                            </>
                        ) : (
                            "Confirm Check-In"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
