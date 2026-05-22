import { RoomDataTable } from "./components/data-table";

export default function RoomRegistrationModule() {
    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Room Registration</h1>
                <p className="text-muted-foreground mt-2">
                    Manage hotel rooms, configure statuses, types, and primary images.
                </p>
            </div>
            
            <RoomDataTable />
        </div>
    );
}
