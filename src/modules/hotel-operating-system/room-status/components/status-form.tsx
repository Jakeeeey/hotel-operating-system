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
    status_name: z.string().min(1, "Status name is required"),
    ui_color_code: z.string().min(1, "UI color code is required"),
});

type RoomStatusFormValues = z.infer<typeof formSchema>;

interface RoomStatusFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
    onSuccess: () => void;
}

export function RoomStatusForm({ open, onOpenChange, initialData, onSuccess }: RoomStatusFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<RoomStatusFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status_name: "",
            ui_color_code: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    status_name: initialData.status_name,
                    ui_color_code: initialData.ui_color_code || "",
                });
            } else {
                form.reset({
                    status_name: "",
                    ui_color_code: "",
                });
            }
        }
    }, [open, initialData, form]);

    const onSubmit = async (values: RoomStatusFormValues) => {
        try {
            setLoading(true);
            const url = initialData ? `/api/hos/room-status/${initialData.id}` : "/api/hos/room-status";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to save room status");

            toast.success(`Room status ${initialData ? "updated" : "created"} successfully`);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("An error occurred while saving");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Room Status" : "New Room Status"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="status_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Available" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ui_color_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UI Color Code</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2 items-center">
                                            <Input placeholder="e.g. #10B981" {...field} />
                                            {field.value && (
                                                <div 
                                                    className="w-8 h-8 rounded border shrink-0 shadow-sm" 
                                                    style={{ backgroundColor: field.value }}
                                                />
                                            )}
                                        </div>
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
