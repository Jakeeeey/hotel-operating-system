import { RoomStatusDataTable } from "./components/data-table";

export default function RoomStatusModule() {
    return (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Room Statuses</h1>
                <p className="text-muted-foreground mt-1">
                    Manage room statuses and their corresponding UI color codes.
                </p>
            </div>
            
            <RoomStatusDataTable />
        </div>
    );
}
