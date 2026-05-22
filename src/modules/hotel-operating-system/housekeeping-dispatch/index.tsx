"use client";

import { useState, useEffect, useMemo } from "react";
import { TaskQueue } from "./components/task-queue";
import { NewTaskModal } from "./components/new-task-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, CheckCircle2, Loader2, Wrench, Filter } from "lucide-react";
import { toast } from "sonner";

export default function HousekeepingDispatchModule() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [stats, setStats] = useState({ dirtyRooms: 0, inProgress: 0, cleanedToday: 0 });
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hos/housekeeping");
            if (!res.ok) throw new Error("Failed to load data");
            const json = await res.json();
            
            setStats(json.data.stats);
            setTasks(json.data.tasks);
        } catch (error) {
            toast.error("Failed to load housekeeping dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            if (statusFilter !== "All" && task.status !== statusFilter) return false;
            
            if (typeFilter !== "All") {
                if (typeFilter === "Maintenance" && !task.task_type.includes("Maintenance")) return false;
                if (typeFilter === "Cleaning" && task.task_type.includes("Maintenance")) return false;
            }
            
            // By default, maybe hide "Completed" tasks from main view unless specifically asked for?
            // Actually, let's just show them if "All" is selected or specifically filtered.
            if (statusFilter === "All" && task.status === "Completed") {
                // Show completed tasks from today only, or just hide them? 
                // Let's show all for now since the API sorts by created_at.
            }

            return true;
        });
    }, [tasks, statusFilter, typeFilter]);

    return (
        <div className="p-4 md:p-6 space-y-8 w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                        <Wrench className="h-7 w-7 text-primary" />
                        Housekeeping Dispatch
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Manage room turnovers, coordinate cleaning staff, and track maintenance requests.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setModalOpen(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl shadow-sm"
                    >
                        + New Custom Task
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-t-4 border-t-red-500 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-semibold">Dirty Rooms (Needs Turn)</span>
                        </div>
                        <div className="text-4xl font-extrabold text-foreground">
                            {loading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : stats.dirtyRooms}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-amber-500 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <Clock className="h-5 w-5" />
                            <span className="font-semibold">In Progress / Inspecting</span>
                        </div>
                        <div className="text-4xl font-extrabold text-foreground">
                            {loading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : stats.inProgress}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-emerald-500 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-semibold">Cleaned Today</span>
                        </div>
                        <div className="text-4xl font-extrabold text-foreground">
                            {loading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : stats.cleanedToday}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Queue */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 bg-muted/40 p-3 rounded-xl border">
                    <Filter className="h-4 w-4 text-muted-foreground ml-1" />
                    <span className="text-sm font-semibold text-muted-foreground">Filter Queue:</span>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Inspecting">Inspecting</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Task Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Types</SelectItem>
                            <SelectItem value="Cleaning">Cleaning</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <TaskQueue tasks={filteredTasks} onTaskUpdated={fetchDashboardData} />
                )}
            </div>

            <NewTaskModal 
                open={modalOpen} 
                onOpenChange={setModalOpen} 
                onSuccess={fetchDashboardData} 
            />
        </div>
    );
}
