"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoomForm } from "./room-form";
import { Plus, Edit, Trash, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function RoomDataTable() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterFloor, setFilterFloor] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterFloor) params.append("floor", filterFloor);
            if (filterStatus && filterStatus !== "all") params.append("status", filterStatus);
            if (filterType && filterType !== "all") params.append("type", filterType);

            const res = await fetch(`/api/hos/room-registration?${params.toString()}`);
            const data = await res.json();
            setRooms(data.data || []);
        } catch (error) {
            toast.error("Failed to fetch rooms");
        } finally {
            setLoading(false);
        }
    };

    const fetchFilters = async () => {
        try {
            const [typeRes, statusRes] = await Promise.all([
                fetch("/api/hos/room-type"),
                fetch("/api/hos/room-status")
            ]);
            const typeData = await typeRes.json();
            const statusData = await statusRes.json();
            setTypes(typeData.data || []);
            setStatuses(statusData.data || []);
        } catch (error) {
            console.error("Failed to fetch filters");
        }
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchRooms();
    }, [filterFloor, filterStatus, filterType]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this room?")) return;
        try {
            const res = await fetch(`/api/hos/room-registration/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Room deleted successfully");
            fetchRooms();
        } catch (error) {
            toast.error("Failed to delete room");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
                <div className="flex gap-4 flex-wrap">
                    <Input
                        placeholder="Filter by floor..."
                        value={filterFloor}
                        onChange={(e) => setFilterFloor(e.target.value)}
                        className="w-40"
                    />
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {types.map((t) => (
                                <SelectItem key={t.id} value={t.id.toString()}>{t.type_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statuses.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>{s.status_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => { setEditingRoom(null); setIsFormOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Room
                </Button>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Room Number</TableHead>
                            <TableHead>Floor</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    Loading rooms...
                                </TableCell>
                            </TableRow>
                        ) : rooms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No rooms found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rooms.map((room) => (
                                <TableRow key={room.id}>
                                    <TableCell>
                                        {room.main_image_url ? (
                                            <div className="w-12 h-12 rounded-md overflow-hidden border relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={room.main_image_url} alt={room.room_number} className="object-cover w-full h-full" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-md border flex items-center justify-center bg-muted">
                                                <ImageIcon className="h-5 w-5 text-muted-foreground opacity-50" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{room.room_number}</TableCell>
                                    <TableCell>{room.floor_number}</TableCell>
                                    <TableCell>{room.type_id?.type_name || "N/A"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {room.status_id?.ui_color_code && (
                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: room.status_id.ui_color_code }} />
                                            )}
                                            {room.status_id?.status_name || "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingRoom(room); setIsFormOpen(true); }}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(room.id)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <RoomForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingRoom}
                onSuccess={fetchRooms}
            />
        </div>
    );
}
