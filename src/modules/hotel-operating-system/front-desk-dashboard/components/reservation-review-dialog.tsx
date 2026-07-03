"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, AlertTriangle, User, Calendar, CreditCard, DoorOpen } from "lucide-react";

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

interface ReservationDetails {
    reservationId: number;
    status: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    bookingSource: string;
    guest: {
        firstName: string;
        lastName: string;
        email: string;
        contactNumber: string;
    };
    roomTypeName: string;
    roomTypeId: number | null;
    roomId: number | null;
    roomNumber: string;
    nights: number;
    adultsCount: number;
    childrenCount: number;
}

interface ReservationReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    arrival: ArrivalItem | null;
    onSuccess: () => void;
}

export function ReservationReviewDialog({ open, onOpenChange, arrival, onSuccess }: ReservationReviewDialogProps) {
    const [details, setDetails] = useState<ReservationDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string>("");
    const [depositAmount, setDepositAmount] = useState<string>("1000");
    const [depositMethod, setDepositMethod] = useState<string>("Cash");
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Determine if room is already assigned (from arrival, then fallback to details)
    const hasRoom = arrival?.roomId != null || details?.roomId != null;
    const finalRoomId = arrival?.roomId || details?.roomId;
    const finalRoomNumber = arrival?.roomNumber || details?.roomNumber;
    const finalRoomTypeId = arrival?.roomTypeId || details?.roomTypeId;

    // Early Check-In / Dirty Room Mandate check
    const isRoomDirty = hasRoom && arrival?.roomHousekeepingStatusId != null && arrival.roomHousekeepingStatusId !== 1;
    const isCheckedIn = arrival?.status === "Checked-In" || details?.status === "Checked-In";

    useEffect(() => {
        if (!open || !arrival) return;

        // Fetch details
        setLoadingDetails(true);
        fetch(`/api/hos/front-desk-dashboard/reservation-details?reservationId=${arrival.reservationId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.data) {
                    setDetails(data.data);
                } else {
                    toast.error("Failed to load reservation details.");
                }
            })
            .catch(() => toast.error("Failed to load reservation details."))
            .finally(() => setLoadingDetails(false));

        // Setup room assignment
        if (arrival.roomId) {
            setSelectedRoomId(arrival.roomId.toString());
            setAvailableRooms([]);
        } else if (arrival.roomTypeId) {
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
    }, [open, arrival]);

    const handleCheckIn = async () => {
        if (!arrival) return;

        const roomId = hasRoom ? finalRoomId : parseInt(selectedRoomId, 10);
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
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Review Reservation</DialogTitle>
                    <DialogDescription>
                        Reservation Ref: #{arrival.reservationId}
                    </DialogDescription>
                </DialogHeader>

                {loadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p>Loading reservation details...</p>
                    </div>
                ) : details ? (
                    <div className="space-y-6 py-4">
                        {/* Status Badge */}
                        <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border">
                            <span className="text-sm font-medium">Current Status</span>
                            <Badge variant={details.status === "Checked-In" ? "default" : "secondary"}>
                                {details.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            {/* Guest Details */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                    <User className="h-4 w-4" /> Guest Information
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{details.guest.firstName} {details.guest.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{details.guest.email || "No email provided"}</p>
                                    <p className="text-xs text-muted-foreground">{details.guest.contactNumber || "No contact provided"}</p>
                                </div>
                            </div>

                            {/* Stay Details */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                    <Calendar className="h-4 w-4" /> Stay Details
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Check-In</p>
                                        <p className="font-medium">{details.checkIn}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Check-Out</p>
                                        <p className="font-medium">{details.checkOut}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-muted-foreground">Duration</p>
                                        <p className="font-medium">{details.nights} {details.nights === 1 ? 'night' : 'nights'} ({details.adultsCount} Adults, {details.childrenCount} Children)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Room Details */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                    <DoorOpen className="h-4 w-4" /> Room Information
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p><span className="text-muted-foreground">Type:</span> {details.roomTypeName}</p>
                                    <p><span className="text-muted-foreground">Assigned:</span> {finalRoomNumber ? `Room ${finalRoomNumber}` : "Unassigned"}</p>
                                </div>
                            </div>

                            {/* Financial Details */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                    <CreditCard className="h-4 w-4" /> Financial
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p><span className="text-muted-foreground">Total:</span> ₱{details.totalAmount.toLocaleString()}</p>
                                    <p><span className="text-muted-foreground">Source:</span> {details.bookingSource}</p>
                                </div>
                            </div>
                        </div>

                        {!isCheckedIn && (
                            <div className="border-t pt-5 space-y-4">
                                <h3 className="text-sm font-semibold">Check-In Actions</h3>

                                {/* Hard Stop Alert if room is dirty */}
                                {isRoomDirty && (
                                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex gap-2.5 items-start text-xs text-destructive">
                                        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                                        <div>
                                            <p className="font-bold">Early Check-In Hard Stop</p>
                                            <p className="mt-0.5 leading-normal">Room not ready. Reassign room or await Housekeeping clearance.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Room Assignment */}
                                {!hasRoom && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Assign Room <span className="text-destructive">*</span></Label>
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

                                {/* Incidental Deposit */}
                                <div className="bg-muted/20 p-4 rounded-lg border space-y-3">
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
                        )}
                    </div>
                ) : (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                        No details available.
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        Close
                    </Button>
                    {!isCheckedIn && details && (
                        <Button
                            onClick={handleCheckIn}
                            disabled={submitting || (!hasRoom && !selectedRoomId) || isRoomDirty || loadingRooms}
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
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
