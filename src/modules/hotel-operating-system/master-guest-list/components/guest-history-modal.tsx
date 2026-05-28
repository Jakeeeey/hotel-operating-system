import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, CalendarDays } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

export interface ReservationItem {
    room_id?: {
        room_number?: string;
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
    if (!guest) return null;

    const renderReservations = () => {
        if (!guest.reservations || guest.reservations.length === 0) {
            return (
                <div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                    No stay history found for this guest.
                </div>
            );
        }

        // Sort reservations by check in date descending (most recent first)
        const sorted = [...guest.reservations].sort((a, b) => {
            return new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime();
        });

        return (
            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Dates</TableHead>
                            <TableHead>Rooms</TableHead>
                            <TableHead>Length of Stay</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sorted.map((res) => {
                            const checkIn = res.check_in_date;
                            const checkOut = res.check_out_date;
                            
                            let nights = 0;
                            try {
                                if (checkIn && checkOut) {
                                    nights = differenceInDays(parseISO(checkOut), parseISO(checkIn));
                                }
                            } catch (e) {
                                console.error("Error parsing dates", e);
                            }

                            const rooms = (res.reservation_items || [])
                                .map(item => item.room_id?.room_number)
                                .filter(Boolean)
                                .join(", ");

                            return (
                                <TableRow key={res.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col gap-1">
                                            <span>In: {checkIn}</span>
                                            <span>Out: {checkOut}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{rooms || "N/A"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            {nights} {nights === 1 ? 'night' : 'nights'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={res.status === 'Completed' ? 'default' : 'secondary'}>
                                            {res.status || 'Unknown'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <User className="h-6 w-6 text-primary" />
                        {guest.first_name} {guest.last_name}
                    </DialogTitle>
                    <DialogDescription>
                        Guest Stay History and Contact Details
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
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
                        {renderReservations()}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
