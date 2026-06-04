"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Calendar, Home, ArrowRight, Check, RotateCcw, AlertTriangle, Search, Loader2, CreditCard } from "lucide-react";
import { ReviewModal } from "./review-modal";
import { PaymentQrModal } from "./payment-qr-modal";

interface RoomType {
    id: number;
    name: string;
    price: string | number;
}

interface AvailableRoom {
    id: number;
    room_number: string;
    floor_number: number | null;
}
// Helpers
const getManilaDateString = (d: Date = new Date()) => {
    const manilaDate = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    return manilaDate.toISOString().replace('Z', '').split('T')[0];
};

const getTodayStr = () => getManilaDateString();
const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getManilaDateString(d);
};

export function BookingForm() {
    // Mode State
    const [isWalkIn, setIsWalkIn] = useState(false);

    // Form States
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [idPassport, setIdPassport] = useState("");

    // Date States (default: today to tomorrow)
    const [checkInDate, setCheckInDate] = useState(getTodayStr());
    const [checkOutDate, setCheckOutDate] = useState(getTomorrowStr());

    // Room Selection States
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState("");
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState("unassigned");
    const [bookingSource, setBookingSource] = useState("Website");

    // UI/Flow States
    const [lookupStatus, setLookupStatus] = useState<"idle" | "searching" | "found" | "new">("idle");
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Modal State
    const [reviewOpen, setReviewOpen] = useState(false);

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState("GCash");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentNotes, setPaymentNotes] = useState("");

    // QR Payment Modal State
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [savedBookingData, setSavedBookingData] = useState<{
        reservationId: number;
        guestName: string;
        roomTypeName: string;
        roomNumber: string;
        nights: number;
        basePrice: number;
        totalAmount: number;
        paymentMethod: string;
        paymentAmount: number;
    } | null>(null);

    // Fetch room types on load
    useEffect(() => {
        setLoadingTypes(true);
        fetch("/api/hos/room-type")
            .then((res) => res.json())
            .then((data) => {
                setRoomTypes(data.data || []);
                setLoadingTypes(false);
            })
            .catch(() => {
                toast.error("Failed to load room types.");
                setLoadingTypes(false);
            });
    }, []);

    // Whenever Room Type is changed, fetch available rooms
    useEffect(() => {
        if (!selectedRoomTypeId) {
            setAvailableRooms([]);
            setSelectedRoomId("unassigned");
            return;
        }

        setLoadingRooms(true);
        fetch(`/api/hos/front-desk-dashboard/available-rooms?roomTypeId=${selectedRoomTypeId}`)
            .then((res) => res.json())
            .then((data) => {
                setAvailableRooms(data.data || []);
                setSelectedRoomId("unassigned");
                setLoadingRooms(false);
            })
            .catch(() => {
                toast.error("Failed to load available rooms for this type.");
                setAvailableRooms([]);
                setSelectedRoomId("unassigned");
                setLoadingRooms(false);
            });
    }, [selectedRoomTypeId]);

    // Walk-in overrides
    useEffect(() => {
        if (isWalkIn) {
            setCheckInDate(getTodayStr());
            setBookingSource("Walk-In");
            if (selectedRoomId === "unassigned") setSelectedRoomId("");
        } else {
            setBookingSource("Website");
            if (selectedRoomId === "") setSelectedRoomId("unassigned");
        }
    }, [isWalkIn, selectedRoomId]);

    // Guest lookup trigger
    const handleEmailBlur = async () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !trimmedEmail.includes("@")) {
            return;
        }

        setLookupStatus("searching");
        try {
            const res = await fetch(`/api/hos/room-booking/guest-lookup?email=${encodeURIComponent(trimmedEmail)}`);
            const result = await res.json();

            if (result.found && result.data) {
                const guest = result.data;
                setFirstName(guest.first_name || "");
                setLastName(guest.last_name || "");
                setPhone(guest.phone_number || "");
                setIdPassport(guest.id_passport_number || "");
                setLookupStatus("found");
                toast.success(`Welcome back! Found existing profile for ${guest.first_name}.`);
            } else {
                setLookupStatus("new");
            }
        } catch {
            setLookupStatus("idle");
        }
    };

    // Calculate duration
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Get current room type pricing
    const currentRoomType = roomTypes.find((t) => t.id.toString() === selectedRoomTypeId);
    const basePrice = currentRoomType ? Number(currentRoomType.price) : 0;
    const totalPrice = basePrice * nights;

    // Reset Form
    const handleClearForm = (silent = false) => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setIdPassport("");
        setCheckInDate(getTodayStr());
        setCheckOutDate(getTomorrowStr());
        setSelectedRoomTypeId("");
        setSelectedRoomId(isWalkIn ? "" : "unassigned");
        setBookingSource(isWalkIn ? "Walk-In" : "Website");
        setLookupStatus("idle");
        setPaymentMethod("GCash");
        setPaymentAmount("");
        setPaymentNotes("");
        if (!silent) toast.info("Form cleared.");
    };

    // Validate and submit for review
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!firstName.trim() || !lastName.trim()) {
            toast.error("Please enter guest First Name and Last Name.");
            return;
        }

        if (!selectedRoomTypeId) {
            toast.error("Please select a Room Type.");
            return;
        }

        if (nights <= 0) {
            toast.error("Check-out date must be after the Check-in date.");
            return;
        }

        if (isWalkIn && selectedRoomId === "unassigned") {
            toast.error("Walk-in bookings require a physical room assignment.");
            return;
        }

        // Open review modal
        setReviewOpen(true);
    };

    // Confirm save in DB
    const handleConfirmBooking = async () => {
        setSubmitting(true);
        try {
            const paidAmount = parseFloat(paymentAmount) || 0;

            const payload = {
                guest: {
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    email: email.trim() || undefined,
                    phone_number: phone.trim() || undefined,
                    id_passport_number: idPassport.trim() || undefined,
                },
                check_in_date: checkInDate,
                check_out_date: checkOutDate,
                booking_source: bookingSource,
                room_type_id: parseInt(selectedRoomTypeId, 10),
                room_id: selectedRoomId === "unassigned" ? null : parseInt(selectedRoomId, 10),
                is_walk_in: isWalkIn,
                payment: paidAmount > 0 ? {
                    amount: paidAmount,
                    payment_method: paymentMethod,
                    notes: paymentNotes.trim() || undefined,
                } : undefined,
            };

            const res = await fetch("/api/hos/room-booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to create booking");
            }

            const result = await res.json();

            toast.success(
                isWalkIn
                    ? `Walk-in registered & checked in successfully!`
                    : `Advance reservation saved successfully!`
            );

            // Close review modal
            setReviewOpen(false);

            // If payment amount > 0 and method is digital (QR-eligible), show QR modal
            if (paidAmount > 0 && (paymentMethod === "GCash" || paymentMethod === "PayMaya")) {
                setSavedBookingData({
                    reservationId: result.data?.reservationId,
                    guestName: `${firstName.trim()} ${lastName.trim()}`,
                    roomTypeName: currentRoomType ? currentRoomType.name : "",
                    roomNumber: roomNumberStr,
                    nights,
                    basePrice,
                    totalAmount: totalPrice,
                    paymentMethod,
                    paymentAmount: paidAmount,
                });
                setQrModalOpen(true);
            } else {
                // Cash or no payment — just reset
                handleClearForm(true);
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred while creating booking.");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle QR payment completion
    const handleQrPaymentComplete = () => {
        setQrModalOpen(false);
        setSavedBookingData(null);
        handleClearForm(true);
    };

    // Find assigned room number
    const assignedRoomObj = availableRooms.find((r) => r.id.toString() === selectedRoomId);
    const roomNumberStr = assignedRoomObj ? assignedRoomObj.room_number : "";

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex justify-center sm:justify-start">
                <div className="bg-muted p-1 rounded-xl inline-flex items-center gap-1 border border-muted-foreground/10 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setIsWalkIn(false)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                            !isWalkIn
                                ? "bg-background text-foreground shadow-sm border border-muted-foreground/10"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Calendar className="h-4 w-4" />
                        Advance Reservation
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsWalkIn(true)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                            isWalkIn
                                ? "bg-background text-foreground shadow-sm border border-muted-foreground/10"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Home className="h-4 w-4" />
                        Immediate Walk-In
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 xl:gap-14">
                {/* Columns 1 & 2: Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* GUEST DETAILS CARD */}
                    <Card className="shadow-md border border-muted/80 rounded-2xl bg-card overflow-hidden">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        Guest Information
                                    </CardTitle>
                                    <CardDescription>Capture profile details or retrieve from history by email</CardDescription>
                                </div>
                                {lookupStatus === "searching" && (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Checking CRM...
                                    </span>
                                )}
                                {lookupStatus === "found" && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        Guest Profile Found ✓
                                    </span>
                                )}
                                {lookupStatus === "new" && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                        New Guest Profile
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-sm font-semibold">
                                        Email Address <span className="text-muted-foreground font-normal">(Used for lookups)</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="guest@example.com"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (lookupStatus !== "idle") setLookupStatus("idle");
                                            }}
                                            onBlur={handleEmailBlur}
                                            className="rounded-xl border border-muted-foreground/20 focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-sm font-semibold">
                                        Phone / Contact Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        placeholder="+63 917 123 4567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="rounded-xl border border-muted-foreground/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                                <div className="space-y-1.5">
                                    <Label htmlFor="firstName" className="text-sm font-semibold">
                                        First Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Jane"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="rounded-xl border border-muted-foreground/20"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="lastName" className="text-sm font-semibold">
                                        Last Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="rounded-xl border border-muted-foreground/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="idPassport" className="text-sm font-semibold">
                                    ID / Passport Number
                                </Label>
                                <Input
                                    id="idPassport"
                                    placeholder="e.g. passport or driving license ID"
                                    value={idPassport}
                                    onChange={(e) => setIdPassport(e.target.value)}
                                    className="rounded-xl border border-muted-foreground/20"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* STAY & ROOM ASSIGNMENT CARD */}
                    <Card className="shadow-md border border-muted/80 rounded-2xl bg-card overflow-hidden">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                Stay & Room Assignment
                            </CardTitle>
                            <CardDescription>Set the dates and choose room types and physical rooms</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* Dates */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                                <div className="space-y-1.5">
                                    <Label htmlFor="checkInDate" className="text-sm font-semibold">
                                        Check-In Date
                                    </Label>
                                    <Input
                                        id="checkInDate"
                                        type="date"
                                        value={checkInDate}
                                        onChange={(e) => setCheckInDate(e.target.value)}
                                        disabled={isWalkIn}
                                        className="rounded-xl border border-muted-foreground/20 disabled:bg-muted disabled:text-muted-foreground font-medium"
                                    />
                                    {isWalkIn && (
                                        <p className="text-xs text-muted-foreground italic mt-1">
                                            Walk-ins default to today&apos;s date.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="checkOutDate" className="text-sm font-semibold">
                                        Check-Out Date
                                    </Label>
                                    <Input
                                        id="checkOutDate"
                                        type="date"
                                        value={checkOutDate}
                                        onChange={(e) => setCheckOutDate(e.target.value)}
                                        className="rounded-xl border border-muted-foreground/20 font-medium"
                                        min={checkInDate}
                                    />
                                </div>
                            </div>

                            {/* Inner gray bg card for room selections */}
                            <div className="bg-muted/40 border border-muted/70 rounded-xl p-5 space-y-4">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold">
                                            Room Type <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={selectedRoomTypeId}
                                            onValueChange={setSelectedRoomTypeId}
                                        >
                                            <SelectTrigger className="rounded-xl border border-muted-foreground/20 bg-background text-foreground">
                                                <SelectValue placeholder={loadingTypes ? "Loading types..." : "Select room type..."} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roomTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.name} (₱{Number(type.price).toLocaleString()}/night)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold flex items-center gap-1">
                                            Assign Specific Room
                                            {isWalkIn && <span className="text-destructive font-bold text-xs">Required</span>}
                                        </Label>
                                        <Select
                                            value={selectedRoomId}
                                            onValueChange={setSelectedRoomId}
                                            disabled={!selectedRoomTypeId || loadingRooms}
                                        >
                                            <SelectTrigger className="rounded-xl border border-muted-foreground/20 bg-background text-foreground">
                                                <SelectValue
                                                    placeholder={
                                                        loadingRooms
                                                            ? "Loading rooms..."
                                                            : !selectedRoomTypeId
                                                            ? "Select type first..."
                                                            : isWalkIn
                                                            ? "Select Available Room Now..."
                                                            : "Leave Unassigned (Assign at Check-in)"
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {!isWalkIn && (
                                                    <SelectItem value="unassigned">
                                                        Leave Unassigned (Assign at Check-in)
                                                    </SelectItem>
                                                )}
                                                {availableRooms.map((room) => (
                                                    <SelectItem key={room.id} value={room.id.toString()}>
                                                        Room {room.room_number} {room.floor_number != null && `(Floor ${room.floor_number})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Dynamic helpers */}
                                {isWalkIn ? (
                                    <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>
                                            Walk-ins must be assigned a physical room immediately. The room will be set to **Occupied** on save.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2 text-xs text-blue-800 dark:text-blue-400 bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
                                        <Search className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>
                                            Advance bookings reserve the **Room Type**, not the physical room. Assigning a specific room is optional.
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Booking Source (Advance Only) */}
                            {!isWalkIn && (
                                <div className="space-y-1.5 max-w-[280px]">
                                    <Label className="text-sm font-semibold">Booking Source</Label>
                                    <Select value={bookingSource} onValueChange={setBookingSource}>
                                        <SelectTrigger className="rounded-xl border border-muted-foreground/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Website">Website</SelectItem>
                                            <SelectItem value="Phone">Phone Call</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* PAYMENT INFORMATION CARD */}
                    <Card className="shadow-md border border-muted/80 rounded-2xl bg-card overflow-hidden">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                Payment Information
                            </CardTitle>
                            <CardDescription>Capture initial payment or deposit details</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold">Payment Method</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="rounded-xl border border-muted-foreground/20 bg-background text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GCash">GCash</SelectItem>
                                            <SelectItem value="PayMaya">PayMaya</SelectItem>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="paymentAmount" className="text-sm font-semibold">
                                        Amount to Pay Now (₱)
                                    </Label>
                                    <Input
                                        id="paymentAmount"
                                        type="number"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="rounded-xl border border-muted-foreground/20 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Quick-fill buttons */}
                            {totalPrice > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-muted-foreground">Quick fill:</span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs rounded-lg"
                                        onClick={() => setPaymentAmount((totalPrice / 2).toFixed(2))}
                                    >
                                        50% Deposit (₱{(totalPrice / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })})
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs rounded-lg"
                                        onClick={() => setPaymentAmount(totalPrice.toFixed(2))}
                                    >
                                        Full Amount (₱{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="paymentNotes" className="text-sm font-semibold">
                                    Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                                </Label>
                                <Textarea
                                    id="paymentNotes"
                                    placeholder="Add any payment-related notes..."
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    className="rounded-xl border border-muted-foreground/20 min-h-[60px]"
                                    rows={2}
                                />
                            </div>

                            {(paymentMethod === "GCash" || paymentMethod === "PayMaya") && parseFloat(paymentAmount) > 0 && (
                                <div className="flex items-start gap-2 text-xs text-blue-800 dark:text-blue-400 bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
                                    <CreditCard className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>
                                        A <strong>QR Code payment screen</strong> will appear after saving this reservation for {paymentMethod} verification.
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Column 3: Booking Summary & Sidebar */}
                <div className="space-y-6">
                    <Card className="shadow-md border border-muted/80 rounded-2xl bg-card overflow-hidden h-fit lg:sticky lg:top-4">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                Stay Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* Summary list */}
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center py-1.5 border-b border-muted/60">
                                    <span className="text-muted-foreground">Flow Mode</span>
                                    <span className="font-semibold text-foreground">
                                        {isWalkIn ? "Immediate Walk-In" : "Advance Reservation"}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-1.5 border-b border-muted/60">
                                    <span className="text-muted-foreground">Nights</span>
                                    <span className="font-semibold text-foreground">
                                        {nights > 0 ? nights : "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-1.5 border-b border-muted/60">
                                    <span className="text-muted-foreground">Room Type</span>
                                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                                        {currentRoomType ? currentRoomType.name : "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-1.5 border-b border-muted/60">
                                    <span className="text-muted-foreground">Assigned Room</span>
                                    <span className="font-semibold text-foreground">
                                        {selectedRoomId !== "unassigned" && roomNumberStr ? `Room ${roomNumberStr}` : "None (Unassigned)"}
                                    </span>
                                </div>

                                <div className="bg-muted/40 rounded-xl p-4 border border-muted/60 mt-4 space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Base Price / Night</span>
                                        <span>₱{basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-foreground pt-1 border-t">
                                        <span>Estimated Total</span>
                                        <span className="text-primary font-extrabold text-lg">
                                            ₱{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2 pt-2">
                                <Button
                                    type="submit"
                                    className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold py-6 text-base transition-all duration-150 flex items-center justify-center gap-2 shadow-md"
                                >
                                    {isWalkIn ? (
                                        <>
                                            Register & Check-In
                                            <ArrowRight className="h-4.5 w-4.5" />
                                        </>
                                    ) : (
                                        <>
                                            Save Reservation
                                            <Check className="h-4.5 w-4.5" />
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleClearForm(false)}
                                    className="w-full rounded-xl border border-muted-foreground/20 hover:bg-muted/80 py-5 text-sm transition-all duration-150 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Clear Form
                                </Button>
                            </div>

                            <p className="text-[10px] text-muted-foreground text-center italic leading-relaxed pt-2">
                                Submitting this form will push data to Directus `guests`, `reservations`, and `reservation_items` collections.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Review confirmation modal */}
            <ReviewModal
                open={reviewOpen}
                onOpenChange={setReviewOpen}
                bookingData={{
                    isWalkIn,
                    firstName,
                    lastName,
                    email,
                    phone,
                    idPassport,
                    checkInDate,
                    checkOutDate,
                    roomTypeId: selectedRoomTypeId,
                    roomTypeName: currentRoomType ? currentRoomType.name : "",
                    roomId: selectedRoomId,
                    roomNumber: roomNumberStr,
                    basePrice,
                    bookingSource,
                    paymentMethod,
                    paymentAmount: parseFloat(paymentAmount) || 0,
                    paymentNotes,
                }}
                submitting={submitting}
                onConfirm={handleConfirmBooking}
            />

            {/* Mock QR Payment Modal */}
            {savedBookingData && (
                <PaymentQrModal
                    open={qrModalOpen}
                    onOpenChange={setQrModalOpen}
                    bookingData={savedBookingData}
                    onPaymentComplete={handleQrPaymentComplete}
                />
            )}
        </form>
    );
}
