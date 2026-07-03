"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, History } from "lucide-react";
import { GuestHistoryModal, Guest } from "./components/guest-history-modal";
import { toast } from "sonner";
import { DataTable } from "./components/new-data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function ReservationHistoryModule() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

    const fetchGuests = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hos/reservation-history");
            if (!res.ok) throw new Error("Failed to load guests");
            const json = await res.json();
            setGuests(json.data || []);
        } catch (error) {
            console.error("Error fetching guests:", error);
            toast.error("Failed to load guest list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuests();
    }, []);

    const handleViewHistory = (guest: Guest) => {
        setSelectedGuest(guest);
        setModalOpen(true);
    };

    const columns = useMemo<ColumnDef<Guest>[]>(() => [
        {
            id: "name",
            header: "Name",
            accessorFn: (row) => `${row.first_name} ${row.last_name}`,
            cell: ({ row }) => <span className="font-medium">{row.original.first_name} {row.original.last_name}</span>
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email") || "N/A"}</span>
        },
        {
            id: "actions",
            header: () => <div className="text-right">Action</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewHistory(row.original)}
                        className="font-semibold shadow-sm rounded-lg opacity-90 hover:opacity-100 transition-opacity"
                    >
                        <History className="h-4 w-4 mr-2" />
                        View History
                    </Button>
                </div>
            )
        }
    ], []);

    return (
        <div className="p-4 md:p-6 space-y-8 w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                        <Users className="h-7 w-7 text-primary" />
                        Reservation History
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        View past and present guests, their contact information, and complete stay history.
                    </p>
                </div>
            </div>

            <Card className="shadow-sm rounded-2xl border-t-4 border-t-primary">
                <CardContent className="p-6">
                    <DataTable
                        columns={columns}
                        data={guests}
                        isLoading={loading}
                        searchKey="name"
                        emptyTitle="No guests found"
                        emptyDescription="There are no guests available to display."
                    />
                </CardContent>
            </Card>

            <GuestHistoryModal 
                open={modalOpen} 
                onOpenChange={setModalOpen} 
                guest={selectedGuest} 
            />
        </div>
    );
}
