"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, Users, History, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GuestHistoryModal, Guest } from "./components/guest-history-modal";
import { toast } from "sonner";

export default function MasterGuestListModule() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

    const fetchGuests = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hos/master-guest-list");
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

    const filteredGuests = guests.filter((guest) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
        return (
            fullName.includes(q) ||
            (guest.email && guest.email.toLowerCase().includes(q))
        );
    });

    const handleViewHistory = (guest: Guest) => {
        setSelectedGuest(guest);
        setModalOpen(true);
    };

    return (
        <div className="p-4 md:p-6 space-y-8 w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                        <Users className="h-7 w-7 text-primary" />
                        Master Guest List
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        View past and present guests, their contact information, and complete stay history.
                    </p>
                </div>
            </div>

            <Card className="shadow-sm rounded-2xl border-t-4 border-t-primary">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search guests by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredGuests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                            No guests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredGuests.map((guest) => (
                                        <TableRow key={guest.id} className="group">
                                            <TableCell className="font-medium">
                                                {guest.first_name} {guest.last_name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {guest.email || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleViewHistory(guest)}
                                                    className="font-semibold shadow-sm rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <History className="h-4 w-4 mr-2" />
                                                    View History
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
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
