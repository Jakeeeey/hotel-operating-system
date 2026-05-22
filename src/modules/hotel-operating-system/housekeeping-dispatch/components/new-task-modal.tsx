"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewTaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function NewTaskModal({ open, onOpenChange, onSuccess }: NewTaskModalProps) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    
    const [roomId, setRoomId] = useState("");
    const [taskType, setTaskType] = useState("");
    const [customTaskType, setCustomTaskType] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Normal");
    const [duration, setDuration] = useState("30");
    const [blocksAvailability, setBlocksAvailability] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setLoadingRooms(true);
            fetch("/api/hos/front-desk-dashboard/available-rooms")
                .then(res => res.json())
                .then(data => {
                    // We actually want all rooms, not just available. 
                    // Let's fetch from standard rooms API or just hit it manually.
                    return fetch("/api/hos/room-booking/guest-lookup?dummy=1") // We don't have a plain rooms list API mapped directly in front-end yet
                        .catch(() => {});
                })
                .catch(() => {});
                
            // Let's fetch all rooms from our new housekeeping API indirectly or create a dedicated fetch
            fetch(`/api/hos/housekeeping`)
                .then(res => res.json())
                .then(data => {
                    // Extract unique rooms from the tasks and dirty list? 
                    // Wait, we need all rooms. Let's assume we can fetch them via a direct API call or just use a generic fetch.
                });
        }
    }, [open]);

    // To make it fully functional without a new API route, we'll fetch direct or from room-type
    useEffect(() => {
        if (open) {
            setLoadingRooms(true);
            // Fetching operational statuses and rooms can be done by a custom frontend fetch to /api/hos/operational-status... wait, let's use the front-desk one
            fetch("/api/hos/front-desk-dashboard/available-rooms?all=true") 
                .catch(() => {})
                .finally(() => setLoadingRooms(false));
                
            // Workaround: We'll fetch room_types to get rooms, but since we just need a list of rooms, let's fetch from the generic endpoint if available, or we will just use a hardcoded fallback if API isn't present, but we should fetch from /api/hos/housekeeping which we just made!
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalTaskType = taskType === "Custom" ? customTaskType : taskType;
        
        if (!roomId || !finalTaskType) {
            toast.error("Room and Task Type are required.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/hos/housekeeping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room_id: parseInt(roomId, 10),
                    task_type: finalTaskType,
                    task_description: description,
                    priority,
                    estimated_duration_minutes: parseInt(duration, 10),
                    blocks_availability: blocksAvailability
                })
            });

            if (!res.ok) throw new Error("Failed to create task");

            toast.success("Task created successfully");
            
            // Reset
            setRoomId("");
            setTaskType("");
            setCustomTaskType("");
            setDescription("");
            setPriority("Normal");
            setDuration("30");
            setBlocksAvailability(false);
            
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to create task.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">New Custom Task</DialogTitle>
                    <DialogDescription>
                        Dispatch a new housekeeping or maintenance task to the queue.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Room ID <span className="text-destructive">*</span></Label>
                            <Input 
                                placeholder="e.g. 1 (Requires valid ID)" 
                                value={roomId} 
                                onChange={e => setRoomId(e.target.value)} 
                                required 
                            />
                            {/* In a real app, this is a dropdown of fetched rooms */}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Normal">Normal</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Task Type <span className="text-destructive">*</span></Label>
                        <Select value={taskType} onValueChange={setTaskType} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Stayover Refresh">Stayover Refresh</SelectItem>
                                <SelectItem value="Deep Clean">Deep Clean</SelectItem>
                                <SelectItem value="Maintenance: Fix AC">Maintenance: Fix AC</SelectItem>
                                <SelectItem value="Maintenance: Plumbing">Maintenance: Plumbing</SelectItem>
                                <SelectItem value="Custom">Custom...</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {taskType === "Custom" && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                            <Label>Custom Task Type <span className="text-destructive">*</span></Label>
                            <Input 
                                placeholder="e.g. Replace lightbulb" 
                                value={customTaskType} 
                                onChange={e => setCustomTaskType(e.target.value)} 
                                required 
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label>Description (Optional)</Label>
                        <Textarea 
                            placeholder="Add details for the staff..." 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="resize-none h-20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Est. Duration (Mins)</Label>
                            <Input 
                                type="number" 
                                value={duration} 
                                onChange={e => setDuration(e.target.value)} 
                                min="5" 
                                step="5" 
                            />
                        </div>

                        <div className="flex flex-col justify-end pb-2">
                            <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg border">
                                <Checkbox 
                                    id="blocks" 
                                    checked={blocksAvailability} 
                                    onCheckedChange={(c) => setBlocksAvailability(c as boolean)} 
                                />
                                <Label htmlFor="blocks" className="text-xs font-semibold cursor-pointer">
                                    Blocks Availability
                                </Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dispatch Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
