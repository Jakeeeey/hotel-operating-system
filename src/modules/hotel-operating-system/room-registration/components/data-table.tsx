"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./new-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Eye, Edit, Trash, Image as ImageIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoomForm } from "./room-form";
import { toast } from "sonner";

export function RoomDataTable() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewingRoom, setViewingRoom] = useState<any>(null);

    const [types, setTypes] = useState<any[]>([]);
    const [opStatuses, setOpStatuses] = useState<any[]>([]);
    const [hkStatuses, setHkStatuses] = useState<any[]>([]);
    const [filterType, setFilterType] = useState("all");
    const [filterOpStatus, setFilterOpStatus] = useState("all");
    const [filterHkStatus, setFilterHkStatus] = useState("all");

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:8055";

    const fetchFilters = async () => {
        try {
            const [typeRes, opRes, hkRes] = await Promise.all([
                fetch("/api/hos/room-type"),
                fetch("/api/hos/operational-status"),
                fetch("/api/hos/housekeeping-status")
            ]);
            const typeData = await typeRes.json();
            const opData = await opRes.json();
            const hkData = await hkRes.json();
            setTypes(typeData.data || []);
            setOpStatuses(opData.data || []);
            setHkStatuses(hkData.data || []);
        } catch (error) {
            console.error("Failed to fetch filters");
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hos/room-registration");
            const result = await res.json();
            setData(result.data || []);
        } catch (error) {
            toast.error("Failed to fetch rooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilters();
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this room?")) return;
        try {
            const res = await fetch(`/api/hos/room-registration/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Room deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete room");
        }
    };

    const getImageUrl = (urlOrUuid: string) => {
        if (!urlOrUuid) return null;
        if (urlOrUuid.startsWith('http') || urlOrUuid.startsWith('data:')) return urlOrUuid;
        return `${API_BASE_URL}/assets/${urlOrUuid}`;
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "main_image_url",
            header: "Image",
            cell: ({ row }) => {
                const imageUrl = getImageUrl(row.original.main_image_url);
                return (
                    imageUrl ? (
                        <div className="w-12 h-12 rounded-md overflow-hidden border relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageUrl} alt={row.original.room_number} className="object-cover w-full h-full" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-md border flex items-center justify-center bg-muted">
                            <ImageIcon className="h-5 w-5 text-muted-foreground opacity-50" />
                        </div>
                    )
                );
            }
        },
        {
            accessorKey: "room_number",
            header: "Room Number",
        },
        {
            accessorKey: "floor_number",
            header: "Floor",
        },
        {
            accessorFn: (row) => row.type_id?.type_name || "N/A",
            id: "type_name",
            header: "Type",
        },
        {
            accessorFn: (row) => {
                const statusId = typeof row.operational_status_id === 'object' ? row.operational_status_id?.id : row.operational_status_id;
                const status = opStatuses.find(s => s.id === statusId);
                return status ? status.status_name : "N/A";
            },
            id: "operational_status_name",
            header: "Op Status",
            cell: ({ row }) => {
                const statusId = typeof row.original.operational_status_id === 'object' ? row.original.operational_status_id?.id : row.original.operational_status_id;
                const status = opStatuses.find(s => s.id === statusId);
                return (
                    <div className="flex items-center gap-2">
                        {status?.ui_color_code && (
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: status.ui_color_code }} />
                        )}
                        {status?.status_name || "N/A"}
                    </div>
                );
            }
        },
        {
            accessorFn: (row) => {
                const statusId = typeof row.housekeeping_status_id === 'object' ? row.housekeeping_status_id?.id : row.housekeeping_status_id;
                const status = hkStatuses.find(s => s.id === statusId);
                return status ? status.status_name : "N/A";
            },
            id: "housekeeping_status_name",
            header: "HK Status",
            cell: ({ row }) => {
                const statusId = typeof row.original.housekeeping_status_id === 'object' ? row.original.housekeeping_status_id?.id : row.original.housekeeping_status_id;
                const status = hkStatuses.find(s => s.id === statusId);
                return (
                    <div className="flex items-center gap-2">
                        {status?.ui_color_code && (
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: status.ui_color_code }} />
                        )}
                        {status?.status_name || "N/A"}
                    </div>
                );
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const record = row.original;
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setViewingRoom(record); setIsViewOpen(true); }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setEditingRoom(record); setIsFormOpen(true); }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(record.id)} className="text-destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const filteredData = data.filter((room) => {
        if (filterType !== "all" && room.type_id?.id?.toString() !== filterType && room.type_id?.toString() !== filterType) return false;
        if (filterOpStatus !== "all" && room.operational_status_id?.id?.toString() !== filterOpStatus && room.operational_status_id?.toString() !== filterOpStatus) return false;
        if (filterHkStatus !== "all" && room.housekeeping_status_id?.id?.toString() !== filterHkStatus && room.housekeeping_status_id?.toString() !== filterHkStatus) return false;
        return true;
    });

    const actionComponent = (
        <>
            <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.type_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={filterOpStatus} onValueChange={setFilterOpStatus}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Op Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Op Statuses</SelectItem>
                    {opStatuses.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.status_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={filterHkStatus} onValueChange={setFilterHkStatus}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="HK Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All HK Statuses</SelectItem>
                    {hkStatuses.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.status_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={() => { setEditingRoom(null); setIsFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add Room
            </Button>
        </>
    );

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={filteredData}
                isLoading={loading}
                searchKey="room_number"
                actionComponent={actionComponent}
                emptyTitle="No rooms found"
                emptyDescription="Add a new room to get started."
            />

            <RoomForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingRoom}
                onSuccess={fetchData}
            />

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>View Room</DialogTitle>
                    </DialogHeader>
                    {viewingRoom && (
                        <div className="space-y-4 mt-4">
                            <div className="flex justify-center mb-6">
                                {getImageUrl(viewingRoom.main_image_url) ? (
                                    <div className="w-48 h-48 rounded-xl overflow-hidden border shadow-sm">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={getImageUrl(viewingRoom.main_image_url)!} alt={viewingRoom.room_number} className="object-cover w-full h-full" />
                                    </div>
                                ) : (
                                    <div className="w-48 h-48 rounded-xl border flex items-center justify-center bg-muted shadow-sm">
                                        <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Room Number</p>
                                    <p className="mt-1 font-semibold">{viewingRoom.room_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Floor</p>
                                    <p className="mt-1">{viewingRoom.floor_number}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                                    <p className="mt-1">{viewingRoom.type_id?.type_name || "N/A"}</p>
                                </div>
                                <div></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Operational Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {(() => {
                                            const statusId = typeof viewingRoom.operational_status_id === 'object' ? viewingRoom.operational_status_id?.id : viewingRoom.operational_status_id;
                                            const status = opStatuses.find(s => s.id === statusId);
                                            return (
                                                <>
                                                    {status?.ui_color_code && (
                                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: status.ui_color_code }} />
                                                    )}
                                                    <p>{status?.status_name || "N/A"}</p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Housekeeping Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {(() => {
                                            const statusId = typeof viewingRoom.housekeeping_status_id === 'object' ? viewingRoom.housekeeping_status_id?.id : viewingRoom.housekeeping_status_id;
                                            const status = hkStatuses.find(s => s.id === statusId);
                                            return (
                                                <>
                                                    {status?.ui_color_code && (
                                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: status.ui_color_code }} />
                                                    )}
                                                    <p>{status?.status_name || "N/A"}</p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end">
                                <Button onClick={() => setIsViewOpen(false)}>Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
