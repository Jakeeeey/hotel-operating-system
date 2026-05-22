"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RoomTypeForm } from "./type-form";
import { Plus, MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

export function RoomTypeDataTable() {
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 500);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);

    const fetchRoomTypes = async () => {
        setLoading(true);
        try {
            const url = debouncedSearch 
                ? `/api/hos/room-type?search=${encodeURIComponent(debouncedSearch)}`
                : "/api/hos/room-type";
            
            const res = await fetch(url);
            const data = await res.json();
            setRoomTypes(data.data || []);
        } catch (error) {
            toast.error("Failed to fetch room types");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoomTypes();
    }, [debouncedSearch]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search type name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={() => { setEditingType(null); setIsFormOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> New Category
                </Button>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type Name</TableHead>
                            <TableHead>Base Price</TableHead>
                            <TableHead>Max Occupancy</TableHead>
                            <TableHead>Bed Configuration</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    Loading room types...
                                </TableCell>
                            </TableRow>
                        ) : roomTypes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    No room types found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            roomTypes.map((type) => (
                                <TableRow key={type.id}>
                                    <TableCell className="font-medium">{type.type_name}</TableCell>
                                    <TableCell>${Number(type.base_price).toFixed(2)}</TableCell>
                                    <TableCell>{type.max_occupancy}</TableCell>
                                    <TableCell>{type.bed_configuration}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { setEditingType(type); setIsFormOpen(true); }}>
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

            <RoomTypeForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingType}
                onSuccess={fetchRoomTypes}
            />
        </div>
    );
}
