"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./new-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Eye, Edit, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RoomStatusForm } from "./status-form";
import { toast } from "sonner";

export function RoomStatusDataTable() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState<any>(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewingStatus, setViewingStatus] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hos/room-status");
            const result = await res.json();
            setData(result.data || []);
        } catch (error) {
            toast.error("Failed to fetch room statuses");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this room status?")) return;
        try {
            const res = await fetch(`/api/hos/room-status/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Room status deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete room status");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "status_name",
            header: "Status Name",
            cell: ({ row }) => {
                const status = row.original;
                return (
                    <div className="flex items-center gap-2">
                        {status.ui_color_code && (
                            <div 
                                className="w-3 h-3 rounded-full shadow-sm" 
                                style={{ backgroundColor: status.ui_color_code }} 
                            />
                        )}
                        {status.status_name}
                    </div>
                );
            }
        },
        {
            accessorKey: "ui_color_code",
            header: "UI Color Code",
            cell: ({ row }) => (
                <code className="text-sm px-2 py-1 bg-muted rounded">
                    {row.original.ui_color_code || "N/A"}
                </code>
            ),
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
                                <DropdownMenuItem onClick={() => { setViewingStatus(record); setIsViewOpen(true); }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setEditingStatus(record); setIsFormOpen(true); }}>
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
        <Button onClick={() => { setEditingStatus(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Category
        </Button>
    );

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchKey="status_name"
                actionComponent={actionComponent}
                emptyTitle="No room statuses found"
                emptyDescription="Add a new room status to get started."
            />

            <RoomStatusForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingStatus}
                onSuccess={fetchData}
            />

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>View Room Status</DialogTitle>
                    </DialogHeader>
                    {viewingStatus && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status Name</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {viewingStatus.ui_color_code && (
                                            <div 
                                                className="w-3 h-3 rounded-full shadow-sm" 
                                                style={{ backgroundColor: viewingStatus.ui_color_code }} 
                                            />
                                        )}
                                        <p>{viewingStatus.status_name}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">UI Color Code</p>
                                    <p className="mt-1">
                                        <code className="text-sm px-2 py-1 bg-muted rounded">
                                            {viewingStatus.ui_color_code || "N/A"}
                                        </code>
                                    </p>
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
