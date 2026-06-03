"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { StatCards } from "./components/stat-cards";
import { ArrivalsTable } from "./components/arrivals-table";
import { DeparturesTable } from "./components/departures-table";
import { CheckInDialog } from "./components/check-in-dialog";
import { ExtendStayDialog } from "./components/extend-stay-dialog";
import { GuestFolioSheet } from "./components/guest-folio-sheet";

interface StatsData {
    totalRooms: number;
    availableRooms: number;
    pendingArrivals: number;
    totalArrivals: number;
    pendingDepartures: number;
    totalDepartures: number;
    completedCheckouts: number;
}

interface ArrivalItem {
    reservationId: number;
    guestName: string;
    roomTypeName: string;
    roomTypeId: number | null;
    status: string;
    roomId: number | null;
    roomNumber: string | null;
}

interface DepartureItem {
    reservationId: number;
    guestName: string;
    roomNumber: string;
    roomId: number | null;
    roomTypeName: string;
    status: string;
}

const defaultStats: StatsData = {
    totalRooms: 0,
    availableRooms: 0,
    pendingArrivals: 0,
    totalArrivals: 0,
    pendingDepartures: 0,
    totalDepartures: 0,
    completedCheckouts: 0,
};

export default function FrontDeskDashboardModule() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatsData>(defaultStats);
    const [arrivals, setArrivals] = useState<ArrivalItem[]>([]);
    const [departures, setDepartures] = useState<DepartureItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Check-in dialog state
    const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
    const [selectedArrival, setSelectedArrival] = useState<ArrivalItem | null>(null);

    // Extend stay dialog state
    const [extendStayDialogOpen, setExtendStayDialogOpen] = useState(false);
    const [selectedDeparture, setSelectedDeparture] = useState<DepartureItem | null>(null);

    // Folio Sheet state
    const [folioOpen, setFolioOpen] = useState(false);
    const [selectedFolioDeparture, setSelectedFolioDeparture] = useState<DepartureItem | null>(null);



    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hos/front-desk-dashboard");
            const result = await res.json();
            if (result.data) {
                setStats(result.data.stats || defaultStats);
                setArrivals(result.data.arrivals || []);
                setDepartures(result.data.departures || []);
            }
        } catch {
            toast.error("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // --- Search filter (guest name + room number) ---
    const filteredArrivals = useMemo(() => {
        if (!searchQuery.trim()) return arrivals;
        const q = searchQuery.toLowerCase();
        return arrivals.filter(
            (a) =>
                a.guestName.toLowerCase().includes(q) ||
                (a.roomNumber && a.roomNumber.toLowerCase().includes(q)) ||
                a.roomTypeName.toLowerCase().includes(q)
        );
    }, [arrivals, searchQuery]);

    const filteredDepartures = useMemo(() => {
        if (!searchQuery.trim()) return departures;
        const q = searchQuery.toLowerCase();
        return departures.filter(
            (d) =>
                d.guestName.toLowerCase().includes(q) ||
                d.roomNumber.toLowerCase().includes(q) ||
                d.roomTypeName.toLowerCase().includes(q)
        );
    }, [departures, searchQuery]);

    // --- Handlers ---
    const handleCheckIn = (arrival: ArrivalItem) => {
        setSelectedArrival(arrival);
        setCheckInDialogOpen(true);
    };

    const handleExtendStay = (departure: DepartureItem) => {
        setSelectedDeparture(departure);
        setExtendStayDialogOpen(true);
    };

    const handleOpenFolio = (departure: DepartureItem) => {
        setSelectedFolioDeparture(departure);
        setFolioOpen(true);
    };


    // --- Date display ---
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Today&apos;s Activity</h1>
                    <div className="flex items-center gap-2 mt-1.5 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span className="text-sm">{dateStr}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search guest or room..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-[220px]"
                        />
                    </div>
                    <Button onClick={() => router.push("/hos/room-booking")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Register Walk-In
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <StatCards stats={stats} isLoading={loading} />

            {/* Arrivals & Departures Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ArrivalsTable
                    arrivals={filteredArrivals}
                    isLoading={loading}
                    onCheckIn={handleCheckIn}
                />
                <DeparturesTable
                    departures={filteredDepartures}
                    isLoading={loading}
                    onExtendStay={handleExtendStay}
                    onOpenFolio={handleOpenFolio}
                    checkingOutId={null}
                />
            </div>

            {/* Check-In Dialog */}
            <CheckInDialog
                open={checkInDialogOpen}
                onOpenChange={setCheckInDialogOpen}
                arrival={selectedArrival}
                onSuccess={fetchDashboard}
            />

            {/* Extend Stay Dialog */}
            <ExtendStayDialog
                open={extendStayDialogOpen}
                onOpenChange={setExtendStayDialogOpen}
                departure={selectedDeparture}
                onSuccess={fetchDashboard}
            />

            {/* Guest Folio Sheet */}
            <GuestFolioSheet
                open={folioOpen}
                onOpenChange={setFolioOpen}
                reservationId={selectedFolioDeparture?.reservationId || null}
                guestName={selectedFolioDeparture?.guestName || ""}
                roomNumber={selectedFolioDeparture?.roomNumber || ""}
                roomId={selectedFolioDeparture?.roomId || null}
                roomTypeName={selectedFolioDeparture?.roomTypeName || ""}
                onCheckOutSuccess={fetchDashboard}
            />
        </div>
    );
}
