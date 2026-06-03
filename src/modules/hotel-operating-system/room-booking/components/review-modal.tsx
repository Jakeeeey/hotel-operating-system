"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Calendar, CreditCard, Loader2 } from "lucide-react";

interface ReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingData: {
        isWalkIn: boolean;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        idPassport: string;
        checkInDate: string;
        checkOutDate: string;
        roomTypeId: string;
        roomTypeName: string;
        roomId: string;
        roomNumber: string;
        basePrice: number;
        bookingSource: string;
        paymentMethod: string;
        paymentAmount: number;
        paymentNotes: string;
    };
    submitting: boolean;
    onConfirm: () => void;
}

export function ReviewModal({ open, onOpenChange, bookingData, submitting, onConfirm }: ReviewModalProps) {
    // Calculate nights
    const start = bookingData.checkInDate ? new Date(bookingData.checkInDate) : null;
    const end = bookingData.checkOutDate ? new Date(bookingData.checkOutDate) : null;
    let nights = 0;
    if (start && end && end > start) {
        nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    const totalPrice = bookingData.basePrice * nights;

    const formatDateStr = (dateStr: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-background rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        {bookingData.isWalkIn ? "Confirm Walk-In & Check-In" : "Confirm Advance Reservation"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Please review the reservation details before writing to the database.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6 max-h-[60vh] overflow-y-auto px-1">
                    {/* Guest Section */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            Guest Information
                        </h3>
                        <div className="bg-muted/40 rounded-xl p-4 border border-muted/50 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-0.5">Full Name</p>
                                <p className="font-semibold text-foreground">
                                    {bookingData.firstName} {bookingData.lastName}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-0.5">Contact Phone</p>
                                <p className="text-foreground font-medium">{bookingData.phone || "Not provided"}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-muted-foreground font-medium mb-0.5">Email Address</p>
                                <p className="text-foreground font-medium truncate">{bookingData.email || "Not provided"}</p>
                            </div>
                            {bookingData.idPassport && (
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground font-medium mb-0.5">ID / Passport Number</p>
                                    <p className="text-foreground font-medium">{bookingData.idPassport}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stay & Room Section */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Stay & Room Details
                        </h3>
                        <div className="bg-muted/40 rounded-xl p-4 border border-muted/50 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-0.5">Check-In</p>
                                <p className="font-semibold text-foreground">{formatDateStr(bookingData.checkInDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-0.5">Check-Out</p>
                                <p className="font-semibold text-foreground">{formatDateStr(bookingData.checkOutDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-0.5">Duration</p>
                                <p className="text-foreground font-medium">
                                    {nights} {nights === 1 ? "Night" : "Nights"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-0.5">Booking Source</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                    {bookingData.bookingSource}
                                </span>
                            </div>
                            <div className="col-span-2 border-t pt-3 mt-1 grid grid-cols-2 gap-x-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Room Type Reserved</p>
                                    <p className="font-semibold text-foreground">{bookingData.roomTypeName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Assigned Room</p>
                                    <p className="font-semibold text-foreground">
                                        {bookingData.roomNumber ? `Room ${bookingData.roomNumber}` : "Unassigned (Future Assignment)"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5" />
                            Billing Summary
                        </h3>
                        <div className="bg-muted/40 rounded-xl p-4 border border-muted/50 space-y-2 text-sm">
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Room Rate ({bookingData.roomTypeName})</span>
                                <span>₱{bookingData.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / night</span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Stay Duration</span>
                                <span>× {nights} {nights === 1 ? "night" : "nights"}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between items-center text-foreground font-bold text-base">
                                <span>Estimated Total</span>
                                <span className="text-primary font-bold text-lg">
                                    ₱{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Payment Info */}
                            {bookingData.paymentAmount > 0 && (
                                <>
                                    <div className="border-t pt-2 mt-1 space-y-1.5">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Payment Method</span>
                                            <span className="font-semibold text-foreground">{bookingData.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Amount to Pay Now</span>
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                ₱{bookingData.paymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        {totalPrice - bookingData.paymentAmount > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Remaining Balance</span>
                                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                                    ₱{(totalPrice - bookingData.paymentAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                        className="rounded-xl border border-muted-foreground/20 hover:bg-muted/80 text-foreground transition-all duration-150"
                    >
                        Go Back
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={submitting}
                        className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold px-6 shadow-sm transition-all duration-150 flex items-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : bookingData.isWalkIn ? (
                            "Confirm & Check-In"
                        ) : (
                            "Confirm & Book"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
