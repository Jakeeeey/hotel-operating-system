import { RoomTypeDataTable } from "./components/data-table";

export default function RoomTypeModule() {
    return (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Room Types</h1>
                <p className="text-muted-foreground mt-1">
                    Manage room categories, pricing, and occupancies.
                </p>
            </div>
            
            <RoomTypeDataTable />
        </div>
    );
}
