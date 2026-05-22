"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RoomStatusForm } from "./status-form";
import { Plus, MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

export function RoomStatusDataTable() {
    const [roomStatuses, setRoomStatuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 500);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState<any>(null);

    const fetchRoomStatuses = async () => {
        setLoading(true);
        try {
            const url = debouncedSearch 
                ? `/api/hos/room-status?search=${encodeURIComponent(debouncedSearch)}`
                : "/api/hos/room-status";
            
            const res = await fetch(url);
            const data = await res.json();
            setRoomStatuses(data.data || []);
        } catch (error) {
            toast.error("Failed to fetch room statuses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoomStatuses();
    }, [debouncedSearch]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search status name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={() => { setEditingStatus(null); setIsFormOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> New Category
                </Button>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status Name</TableHead>
                            <TableHead>UI Color Code</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                    Loading room statuses...
                                </TableCell>
                            </TableRow>
                        ) : roomStatuses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                    No room statuses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            roomStatuses.map((status) => (
                                <TableRow key={status.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {status.ui_color_code && (
                                                <div 
                                                    className="w-3 h-3 rounded-full shadow-sm" 
                                                    style={{ backgroundColor: status.ui_color_code }} 
                                                />
                                            )}
                                            {status.status_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-sm px-2 py-1 bg-muted rounded">
                                            {status.ui_color_code || "N/A"}
                                        </code>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { setEditingStatus(status); setIsFormOpen(true); }}>
                                                    Edit
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <RoomStatusForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingStatus}
                onSuccess={fetchRoomStatuses}
            />
        </div>
    );
}
