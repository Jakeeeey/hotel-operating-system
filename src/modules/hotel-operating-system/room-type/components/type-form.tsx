"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
    type_name: z.string().min(1, "Type name is required"),
    base_price: z.number().min(0, "Base price cannot be negative"),
    max_occupancy: z.number().min(1, "Max occupancy must be at least 1"),
    bed_configuration: z.string().min(1, "Bed configuration is required"),
});

type RoomTypeFormValues = z.infer<typeof formSchema>;

interface RoomTypeFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: { id?: string; type_name?: string; base_price?: number; max_occupancy?: number; bed_configuration?: string };
    onSuccess: () => void;
}

export function RoomTypeForm({ open, onOpenChange, initialData, onSuccess }: RoomTypeFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<RoomTypeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type_name: "",
            base_price: 0,
            max_occupancy: 1,
            bed_configuration: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    type_name: initialData.type_name,
                    base_price: Number(initialData.base_price) || 0,
                    max_occupancy: initialData.max_occupancy || 1,
                    bed_configuration: initialData.bed_configuration || "",
                });
            } else {
                form.reset({
                    type_name: "",
                    base_price: 0,
                    max_occupancy: 1,
                    bed_configuration: "",
                });
            }
        }
    }, [open, initialData, form]);

    const onSubmit = async (values: RoomTypeFormValues) => {
        try {
            setLoading(true);
            const url = initialData ? `/api/hos/room-type/${initialData.id}` : "/api/hos/room-type";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to save room type");

            toast.success(`Room type ${initialData ? "updated" : "created"} successfully`);
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
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Room Type" : "New Room Type"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Deluxe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="base_price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Base Price</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            step="0.01" 
                                            {...field} 
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="max_occupancy"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Occupancy</FormLabel>
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
                        <FormField
                            control={form.control}
                            name="bed_configuration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bed Configuration</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 1 King, 2 Queen" {...field} />
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
