import React, { useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, CalendarDays } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { DataTable } from "./new-data-table";
import { ColumnDef } from "@tanstack/react-table";

export interface ReservationItem {
    room_id?: {
        room_number?: string;
    };
    room_type_id?: {
        type_name?: string;
    };
}

export interface Reservation {
    id: number;
    check_in_date: string;
    check_out_date: string;
    status: string;
    reservation_items?: ReservationItem[];
}

export interface Guest {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    contact_number: string | null;
    id_passport_number: string | null;
    reservations?: Reservation[];
}

interface GuestHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guest: Guest | null;
}

export function GuestHistoryModal({ open, onOpenChange, guest }: GuestHistoryModalProps) {
    const sortedReservations = useMemo(() => {
        if (!guest?.reservations) return [];
        return [...guest.reservations].sort((a, b) => {
            return new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime();
        });
    }, [guest]);

    const columns = useMemo<ColumnDef<Reservation>[]>(() => [
        {
            id: "room_number",
            header: "Room Number",
            cell: ({ row }) => {
                const rooms = (row.original.reservation_items || [])
                    .map(item => item.room_id?.room_number)
                    .filter(Boolean)
                    // unique room numbers
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .join(", ");
                return <span className="font-medium">{rooms || "N/A"}</span>;
            }
        },
        {
            id: "room_type",
            header: "Room Type",
            cell: ({ row }) => {
                const types = (row.original.reservation_items || [])
                    .map(item => item.room_type_id?.type_name)
                    .filter(Boolean)
                    // unique types
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .join(", ");
                return <span className="text-muted-foreground">{types || "N/A"}</span>;
            }
        },
        {
            accessorKey: "check_in_date",
            header: "Check In",
            cell: ({ row }) => <span>{row.original.check_in_date}</span>
        },
        {
            accessorKey: "check_out_date",
            header: "Check Out",
            cell: ({ row }) => <span>{row.original.check_out_date}</span>
        },
        {
            id: "length_of_stay",
            header: "Length of Stay",
            cell: ({ row }) => {
                const checkIn = row.original.check_in_date;
                const checkOut = row.original.check_out_date;
                let nights = 0;
                try {
                    if (checkIn && checkOut) {
                        nights = differenceInDays(parseISO(checkOut), parseISO(checkIn));
                    }
                } catch {
                    // Ignore parsing error
                }
                return (
                    <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>{nights} {nights === 1 ? 'night' : 'nights'}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status || 'Unknown';
                // Define adaptive badge colors based on status
                let variantClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80";
                
                if (status.toLowerCase() === 'completed') {
                    variantClass = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
                } else if (status.toLowerCase() === 'pending') {
                    variantClass = "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20";
                } else if (status.toLowerCase() === 'cancelled') {
                    variantClass = "bg-destructive/15 text-destructive dark:text-destructive-foreground border border-destructive/20";
                } else if (status.toLowerCase() === 'in-house' || status.toLowerCase() === 'checked in') {
                    variantClass = "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20";
                }

                return (
                    <Badge variant="outline" className={`font-semibold ${variantClass}`}>
                        {status}
                    </Badge>
                );
            }
        }
    ], []);

    if (!guest) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <User className="h-6 w-6 text-primary" />
                        {guest.first_name} {guest.last_name}
                    </DialogTitle>
                    <DialogDescription>
                        Guest Stay History and Contact Details
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4 overflow-y-auto flex-1 pb-4 px-1">
                    {/* Contact Info Card */}
                    <div className="bg-muted/30 p-4 rounded-xl border flex flex-col md:flex-row gap-6">
                        <div className="space-y-3 flex-1">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contact Information</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{guest.email || "No email provided"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{guest.contact_number || "No contact number"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 flex-1">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Identification</h4>
                            <div className="space-y-2">
                                <div className="text-sm">
                                    <span className="text-muted-foreground mr-2">ID/Passport:</span>
                                    <span className="font-medium">{guest.id_passport_number || "Not on file"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stay History Table */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                            Stay History
                        </h4>
                        <DataTable
                            columns={columns}
                            data={sortedReservations}
                            emptyTitle="No stay history"
                            emptyDescription="No stay history found for this guest."
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
