"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./new-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Eye, Edit, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RoomTypeForm } from "./type-form";
import { toast } from "sonner";

export function RoomTypeDataTable() {
    const [data, setData] = useState<{ id: string; type_name: string; base_price: number; max_occupancy: number; bed_configuration: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingType, setEditingType] = useState<{ id: string; type_name: string; base_price: number; max_occupancy: number; bed_configuration: string } | null>(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewingType, setViewingType] = useState<{ id: string; type_name: string; base_price: number; max_occupancy: number; bed_configuration: string } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hos/room-type");
            const result = await res.json();
            setData(result.data || []);
        } catch {
            toast.error("Failed to fetch room types");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this room type?")) return;
        try {
            const res = await fetch(`/api/hos/room-type/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Room type deleted successfully");
            fetchData();
        } catch {
            toast.error("Failed to delete room type");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: ColumnDef<{ id: string; type_name: string; base_price: number; max_occupancy: number; bed_configuration: string }>[] = [
        {
            accessorKey: "type_name",
            header: "Type Name",
        },
        {
            accessorKey: "base_price",
            header: "Base Price",
            cell: ({ row }) => `₱${Number(row.getValue("base_price")).toFixed(2)}`,
        },
        {
            accessorKey: "max_occupancy",
            header: "Max Occupancy",
        },
        {
            accessorKey: "bed_configuration",
            header: "Bed Configuration",
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
                                <DropdownMenuItem onClick={() => { setViewingType(record); setIsViewOpen(true); }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setEditingType(record); setIsFormOpen(true); }}>
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

    const actionComponent = (
        <Button onClick={() => { setEditingType(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Category
        </Button>
    );

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchKey="type_name"
                actionComponent={actionComponent}
                emptyTitle="No room types found"
                emptyDescription="Add a new room type to get started."
            />

            <RoomTypeForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingType || undefined}
                onSuccess={fetchData}
            />

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>View Room Type</DialogTitle>
                    </DialogHeader>
                    {viewingType && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type Name</p>
                                    <p className="mt-1">{viewingType.type_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Base Price</p>
                                    <p className="mt-1">${Number(viewingType.base_price).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Max Occupancy</p>
                                    <p className="mt-1">{viewingType.max_occupancy}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Bed Configuration</p>
                                    <p className="mt-1">{viewingType.bed_configuration}</p>
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
