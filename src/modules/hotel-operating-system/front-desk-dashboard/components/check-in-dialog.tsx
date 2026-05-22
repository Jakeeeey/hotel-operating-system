"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ArrivalItem {
    reservationId: number;
    guestName: string;
    roomTypeName: string;
    roomTypeId: number | null;
    status: string;
    roomId: number | null;
    roomNumber: string | null;
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
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Determine if room is already assigned
    const hasRoom = arrival?.roomId != null;

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

        setSubmitting(true);
        try {
            const res = await fetch("/api/hos/front-desk-dashboard/check-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservationId: arrival.reservationId,
                    roomId,
                }),
            });

            if (!res.ok) throw new Error("Check-in failed");

            toast.success(`${arrival.guestName} checked in successfully.`);
            onOpenChange(false);
            onSuccess();
        } catch {
            toast.error("Failed to check in guest.");
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
                                <p className="text-sm text-destructive">
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
                        disabled={submitting || (!hasRoom && !selectedRoomId)}
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
