"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface TaskQueueProps {
    tasks: any[];
    onTaskUpdated: () => void;
}

export function TaskQueue({ tasks, onTaskUpdated }: TaskQueueProps) {
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const handleUpdateStatus = async (taskId: number, newStatus: string) => {
        setUpdatingId(taskId);
        try {
            const res = await fetch(`/api/hos/housekeeping/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update task");

            toast.success(`Task marked as ${newStatus}`);
            onTaskUpdated();
        } catch (error) {
            toast.error("Failed to update task status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "Urgent":
            case "High":
                return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">{priority}</Badge>;
            case "Low":
                return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">{priority}</Badge>;
            default:
                return <Badge variant="secondary" className="bg-blue-50 text-blue-800 hover:bg-blue-50 border-blue-200">Normal</Badge>;
        }
    };

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case "Pending":
                return <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><Clock className="h-4 w-4" /> Pending</span>;
            case "In Progress":
                return <span className="flex items-center gap-1.5 text-amber-600 font-bold"><Loader2 className="h-4 w-4 animate-spin" /> In Progress</span>;
            case "Inspecting":
                return <span className="flex items-center gap-1.5 text-purple-600 font-bold"><AlertTriangle className="h-4 w-4" /> Inspecting</span>;
            case "Completed":
                return <span className="flex items-center gap-1.5 text-emerald-600 font-bold"><CheckCircle2 className="h-4 w-4" /> Completed</span>;
            default:
                return status;
        }
    };

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="bg-muted/30 px-4 py-3 border-b flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">Pending Tasks Queue</h3>
            </div>
            
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow>
                            <TableHead className="font-bold w-[120px]">Room #</TableHead>
                            <TableHead className="font-bold">Task Type</TableHead>
                            <TableHead className="font-bold">Details</TableHead>
                            <TableHead className="font-bold w-[100px]">Priority</TableHead>
                            <TableHead className="font-bold w-[140px]">Current Status</TableHead>
                            <TableHead className="font-bold text-right w-[150px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No tasks found matching the current filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tasks.map((task) => (
                                <TableRow key={task.id} className="hover:bg-muted/20 transition-colors">
                                    <TableCell className="font-bold text-base">
                                        Room {task.room_id?.room_number || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold">{task.task_type}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Est. {task.estimated_duration_minutes} mins
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm max-w-[200px] truncate" title={task.task_description}>
                                        {task.task_description || "-"}
                                        {task.blocks_availability === 1 && (
                                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                                                Blocks Room
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                                    <TableCell>{getStatusDisplay(task.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {task.status === "Pending" && (
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="w-full text-xs font-bold border-primary text-primary hover:bg-primary/10"
                                                disabled={updatingId === task.id}
                                                onClick={() => handleUpdateStatus(task.id, "In Progress")}
                                            >
                                                {updatingId === task.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Start Task"}
                                            </Button>
                                        )}
                                        {task.status === "In Progress" && (
                                            <Button 
                                                size="sm" 
                                                className="w-full text-xs font-bold bg-primary hover:bg-primary/90"
                                                disabled={updatingId === task.id}
                                                onClick={() => handleUpdateStatus(task.id, "Completed")}
                                            >
                                                {updatingId === task.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark Complete"}
                                            </Button>
                                        )}
                                        {task.status === "Completed" && (
                                            <span className="text-xs text-muted-foreground">
                                                Done {task.actual_completion_time ? format(new Date(task.actual_completion_time), "HH:mm") : ""}
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
