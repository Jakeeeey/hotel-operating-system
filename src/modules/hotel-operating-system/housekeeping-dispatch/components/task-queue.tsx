"use client";

import { useState } from "react";
import { DataTable } from "./new-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface TaskQueueProps {
    tasks: { id: string | number; room_id?: { room_number?: string }; task_type?: string; estimated_duration_minutes?: number; task_description?: string; blocks_availability?: number; status?: string; priority?: string; actual_completion_time?: string; }[];
    onTaskUpdated: () => void;
}

export function TaskQueue({ tasks, onTaskUpdated }: TaskQueueProps) {
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleUpdateStatus = async (taskId: string | number, newStatus: string) => {
        setUpdatingId(taskId.toString());
        try {
            const now = new Date().toISOString();
            const payload: Record<string, unknown> = { status: newStatus };

            if (newStatus === "In Progress") {
                payload.start_time = now;
            }

            const res = await fetch(`/api/hos/housekeeping/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to update task");

            toast.success(`Task marked as ${newStatus}`);
            onTaskUpdated();
        } catch {
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

    const columns: ColumnDef<{ id: string | number; room_id?: { room_number?: string }; task_type?: string; estimated_duration_minutes?: number; task_description?: string; blocks_availability?: number; status?: string; priority?: string; actual_completion_time?: string; }>[] = [
        {
            accessorKey: "room_id",
            header: "Room #",
            cell: ({ row }) => {
                const task = row.original;
                return (
                    <div className="font-bold text-base">
                        Room {task.room_id?.room_number || "N/A"}
                    </div>
                );
            }
        },
        {
            accessorKey: "task_type",
            header: "Task Type",
            cell: ({ row }) => {
                const task = row.original;
                return (
                    <div>
                        <div className="font-semibold">{task.task_type}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Est. {task.estimated_duration_minutes || '--'} mins
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "task_description",
            header: "Details",
            cell: ({ row }) => {
                const task = row.original;
                return (
                    <div className="text-sm max-w-[200px] truncate" title={task.task_description}>
                        {task.task_description || "-"}
                        {task.blocks_availability === 1 && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                                Blocks Room
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const priority = row.getValue("priority") as string;
                return getPriorityBadge(priority);
            }
        },
        {
            accessorKey: "status",
            header: "Current Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return getStatusDisplay(status);
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right font-bold w-[120px]">Action</div>,
            cell: ({ row }) => {
                const task = row.original;
                return (
                    <div className="flex justify-end w-full pr-4">
                        {task.status === "Pending" && (
                            <Button 
                                size="sm" 
                                variant="outline"
                                className="w-[120px] text-xs font-bold border-primary text-primary hover:bg-primary/10"
                                disabled={updatingId === task.id}
                                onClick={() => handleUpdateStatus(task.id, "In Progress")}
                            >
                                {updatingId === task.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Start Task"}
                            </Button>
                        )}
                        {task.status === "In Progress" && (
                            <Button 
                                size="sm" 
                                className="w-[120px] text-xs font-bold bg-primary hover:bg-primary/90"
                                disabled={updatingId === task.id}
                                onClick={() => handleUpdateStatus(task.id, "Completed")}
                            >
                                {updatingId === task.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark Complete"}
                            </Button>
                        )}
                        {task.status === "Completed" && (
                            <span className="text-xs text-muted-foreground w-[120px] text-right inline-block">
                                Done {task.actual_completion_time ? format(new Date(task.actual_completion_time), "HH:mm") : ""}
                            </span>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="w-full space-y-4">
            <div className="bg-muted/30 px-4 py-3 border rounded-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">Pending Tasks Queue</h3>
            </div>
            
            <DataTable 
                columns={columns} 
                data={tasks} 
                searchKey="task_type" 
                emptyTitle="No Tasks Found"
                emptyDescription="There are no tasks matching your filters."
            />
        </div>
    );
}
