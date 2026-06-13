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
    name: z.string().min(1, "Name is required"),
    price: z.number().min(0, "Price cannot be negative"),
    max_adults: z.number().min(1, "Max adults must be at least 1"),
    max_children: z.number().min(0, "Max children cannot be negative"),
    bed: z.string().min(1, "Bed configuration is required"),
    description: z.string().optional().nullable(),
    original_price: z.number().min(0, "Original price cannot be negative").optional().nullable(),
    sqm: z.string().optional().nullable(),
    badge: z.string().optional().nullable(),
});

type RoomTypeFormValues = z.infer<typeof formSchema>;

interface RoomTypeFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: { 
        id?: string; 
        name?: string; 
        price?: number; 
        max_adults?: number; 
        max_children?: number; 
        bed?: string; 
        description?: string; 
        original_price?: number; 
        sqm?: string; 
        badge?: string; 
    };
    onSuccess: () => void;
}

export function RoomTypeForm({ open, onOpenChange, initialData, onSuccess }: RoomTypeFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<RoomTypeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            price: 0,
            max_adults: 1,
            max_children: 0,
            bed: "King Bed",
            description: "",
            original_price: null,
            sqm: "",
            badge: "Featured",
        },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    name: initialData.name || "",
                    price: Number(initialData.price) || 0,
                    max_adults: initialData.max_adults || 1,
                    max_children: initialData.max_children || 0,
                    bed: initialData.bed || "King Bed",
                    description: initialData.description || "",
                    original_price: initialData.original_price ? Number(initialData.original_price) : null,
                    sqm: initialData.sqm || "",
                    badge: initialData.badge || "Featured",
                });
            } else {
                form.reset({
                    name: "",
                    price: 0,
                    max_adults: 1,
                    max_children: 0,
                    bed: "King Bed",
                    description: "",
                    original_price: null,
                    sqm: "",
                    badge: "Featured",
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
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Room Type" : "New Room Type"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
                        <FormField
                            control={form.control}
                            name="name"
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
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. A spacious room with beautiful view" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
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
                                name="original_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Original Price</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                step="0.01" 
                                                {...field} 
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} 
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
                                name="max_adults"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Adults</FormLabel>
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
                                name="max_children"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Children</FormLabel>
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
                        <FormField
                            control={form.control}
                            name="bed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bed Configuration</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 1 King Bed" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="sqm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Size (SQM)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 35 sqm" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="badge"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Badge</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Featured, Popular" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
