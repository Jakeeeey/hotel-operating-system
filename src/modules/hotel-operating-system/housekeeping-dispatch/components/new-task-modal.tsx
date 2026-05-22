"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface NewTaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function NewTaskModal({ open, onOpenChange, onSuccess }: NewTaskModalProps) {

    const [roomNumber, setRoomNumber] = useState("");
    const [taskType, setTaskType] = useState("");
    const [customTaskType, setCustomTaskType] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Normal");
    const [duration, setDuration] = useState("30");
    const [targetCompletionTime, setTargetCompletionTime] = useState("");
    const [blocksAvailability, setBlocksAvailability] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [taskTypes, setTaskTypes] = useState<{ id: number; status_name: string }[]>([]);

    useEffect(() => {
        if (!open) return;
        const fetchStatuses = async () => {
            try {
                const res = await fetch("/api/hos/housekeeping-status");
                if (res.ok) {
                    const json = await res.json();
                    const filtered = (json.data || []).filter((s: any) => 
                        s.status_name !== "Clean"
                    );
                    setTaskTypes(filtered);
                }
            } catch (err) {
                console.error("Failed to load task types", err);
            }
        };
        fetchStatuses();
    }, [open]);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalTaskType = taskType === "Custom" ? customTaskType : taskType;
        
        if (!roomNumber || !finalTaskType) {
            toast.error("Room Number and Task Type are required.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/hos/housekeeping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room_number: roomNumber,
                    task_type: finalTaskType,
                    task_description: description,
                    priority,
                    estimated_duration_minutes: parseInt(duration, 10),
                    target_completion_time: targetCompletionTime ? new Date(targetCompletionTime).toISOString() : null,
                    blocks_availability: blocksAvailability
                })
            });

            if (!res.ok) throw new Error("Failed to create task");

            toast.success("Task created successfully");
            
            // Reset
            setRoomNumber("");
            setTaskType("");
            setCustomTaskType("");
            setDescription("");
            setPriority("Normal");
            setDuration("30");
            setTargetCompletionTime("");
            setBlocksAvailability(false);
            
            onSuccess();
            onOpenChange(false);
        } catch {
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
                            <Label>Room Number <span className="text-destructive">*</span></Label>
                            <Input 
                                placeholder="e.g. 101" 
                                value={roomNumber} 
                                onChange={e => setRoomNumber(e.target.value)} 
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
                                {taskTypes.map(type => (
                                    <SelectItem key={type.id} value={type.status_name}>{type.status_name}</SelectItem>
                                ))}
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

                        <div className="space-y-1.5">
                            <Label>Target Completion Time</Label>
                            <Input 
                                type="datetime-local" 
                                value={targetCompletionTime} 
                                onChange={e => setTargetCompletionTime(e.target.value)} 
                            />
                        </div>
                    </div>

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
