"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "./image-upload";
import { toast } from "sonner";

const formSchema = z.object({
    room_number: z.string().min(1, "Room number is required").regex(/^[a-zA-Z0-9]+$/, "Room number must be alphanumeric"),
    floor_number: z.number().min(1, "Floor number is required"),
    type_id: z.number().min(1, "Room type is required"),
    operational_status_id: z.number().min(1, "Operational status is required"),
    housekeeping_status_id: z.number().min(1, "Housekeeping status is required"),
    main_image_url: z.string().optional(),
});

type RoomFormValues = z.infer<typeof formSchema>;

interface RoomFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: { id?: string; room_number?: string; floor_number?: number; type_id?: { id: number } | number; operational_status_id?: { id: number } | number; housekeeping_status_id?: { id: number } | number; main_image_url?: string; [key: string]: unknown };
    onSuccess: () => void;
}

export function RoomForm({ open, onOpenChange, initialData, onSuccess }: RoomFormProps) {
    const [types, setTypes] = useState<{ id: number; name: string }[]>([]);
    const [opStatuses, setOpStatuses] = useState<{ id: number; status_name: string; ui_color_code: string }[]>([]);
    const [hkStatuses, setHkStatuses] = useState<{ id: number; status_name: string; ui_color_code: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const form = useForm<RoomFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            room_number: "",
            floor_number: 1,
            type_id: 0,
            operational_status_id: 1,
            housekeeping_status_id: 1,
            main_image_url: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    room_number: initialData.room_number,
                    floor_number: initialData.floor_number || 1,
                    type_id: (typeof initialData.type_id === 'object' && initialData.type_id !== null ? initialData.type_id.id : initialData.type_id) || 0,
                    operational_status_id: (typeof initialData.operational_status_id === 'object' && initialData.operational_status_id !== null ? initialData.operational_status_id.id : initialData.operational_status_id) || 1,
                    housekeeping_status_id: (typeof initialData.housekeeping_status_id === 'object' && initialData.housekeeping_status_id !== null ? initialData.housekeeping_status_id.id : initialData.housekeeping_status_id) || 1,
                    main_image_url: initialData.main_image_url || "",
                });
            } else {
                form.reset({
                    room_number: "",
                    floor_number: 1,
                    type_id: 0,
                    operational_status_id: 1,
                    housekeeping_status_id: 1,
                    main_image_url: "",
                });
            }

            // Fetch Types and Statuses
            fetch("/api/hos/room-type")
                .then((res) => res.json())
                .then((data) => setTypes(data.data || []))
                .catch(() => console.error("Failed to load types"));

            fetch("/api/hos/operational-status")
                .then((res) => res.json())
                .then((data) => setOpStatuses(data.data || []))
                .catch(() => console.error("Failed to load op statuses"));

            fetch("/api/hos/housekeeping-status")
                .then((res) => res.json())
                .then((data) => setHkStatuses(data.data || []))
                .catch(() => console.error("Failed to load hk statuses"));
        }
    }, [open, initialData, form]);

    const onSubmit = async (values: RoomFormValues) => {
        try {
            setLoading(true);
            const url = initialData ? `/api/hos/room-registration/${initialData.id}` : "/api/hos/room-registration";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to save room");

            toast.success(`Room ${initialData ? "updated" : "created"} successfully`);
            onSuccess();
            onOpenChange(false);
        } catch {
            toast.error("An error occurred while saving");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Room" : "Create Room"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="room_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 101A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="floor_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Floor Number</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                {...field} 
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Type</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {types.map((t) => (
                                                    <SelectItem key={t.id} value={t.id.toString()}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="operational_status_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Operational Status</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select operational status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {opStatuses.map((s) => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            {s.ui_color_code && (
                                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.ui_color_code }} />
                                                            )}
                                                            {s.status_name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="housekeeping_status_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Housekeeping Status</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select housekeeping status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {hkStatuses.map((s) => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            {s.ui_color_code && (
                                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.ui_color_code }} />
                                                            )}
                                                            {s.status_name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="main_image_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Image</FormLabel>
                                    <FormControl>
                                        <ImageUpload value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
