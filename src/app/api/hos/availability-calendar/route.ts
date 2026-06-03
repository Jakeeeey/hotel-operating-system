import { NextResponse } from 'next/server';

interface CalendarReservationItem {
    id: string | number;
    room_id?: string | number | null;
    room_type_id?: string | number | null;
    locked_price?: string | number | null;
    reservation_id?: {
        id: string | number;
        status: string;
        check_in_date: string;
        check_out_date: string;
        guest_id?: {
            first_name: string;
            last_name: string;
        } | null;
    } | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function GET(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        if (!start || !end) {
            return NextResponse.json({ error: 'Missing start or end date.' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // Parallel fetch of Room Types, Rooms, Operational Statuses, and Reservation Items
        const [
            typesRes,
            roomsRes,
            statusesRes,
            itemsRes,
            tasksRes
        ] = await Promise.all([
            // 1. Room Types
            fetch(`${API_BASE_URL}/items/room_types?limit=-1&sort=id`, { headers }),
            // 2. Rooms (with operational status)
            fetch(`${API_BASE_URL}/items/rooms?limit=-1&sort=room_number&fields=id,room_number,floor_number,type_id,operational_status_id.id,operational_status_id.status_name,operational_status_id.ui_color_code`, { headers }),
            // 3. Operational Statuses
            fetch(`${API_BASE_URL}/items/operational_statuses?limit=-1`, { headers }),
            // 4. Reservation Items (within date range) with Joins
            fetch(`${API_BASE_URL}/items/reservation_items?limit=-1&fields=id,night_date,locked_price,room_id,room_type_id,reservation_id.id,reservation_id.status,reservation_id.check_in_date,reservation_id.check_out_date,reservation_id.guest_id.first_name,reservation_id.guest_id.last_name&filter=${encodeURIComponent(JSON.stringify({
                _and: [
                    { reservation_id: { check_in_date: { _lte: end } } },
                    { reservation_id: { check_out_date: { _gte: start } } }
                ]
            }))}`, { headers }),
            // 5. Blocking Maintenance Tasks
            fetch(`${API_BASE_URL}/items/housekeeping_tasks?limit=-1&fields=*`, { headers })
        ]);

        if (!typesRes.ok || !roomsRes.ok || !statusesRes.ok || !itemsRes.ok || !tasksRes.ok) {
            const errors = {
                types: !typesRes.ok ? { status: typesRes.status, text: await typesRes.text() } : null,
                rooms: !roomsRes.ok ? { status: roomsRes.status, text: await roomsRes.text() } : null,
                statuses: !statusesRes.ok ? { status: statusesRes.status, text: await statusesRes.text() } : null,
                items: !itemsRes.ok ? { status: itemsRes.status, text: await itemsRes.text() } : null,
                tasks: !tasksRes.ok ? { status: tasksRes.status, text: await tasksRes.text() } : null,
            };
            console.error('Calendar Fetch Error Breakdown:', JSON.stringify(errors, null, 2));
            throw new Error(`Failed to fetch data from Directus. Errors: ${JSON.stringify(errors)}`);
        }

        const typesData = await typesRes.json();
        const roomsData = await roomsRes.json();
        const statusesData = await statusesRes.json();
        const itemsData = await itemsRes.json();
        const rawTasksData = await tasksRes.json();

        // Process reservation items into unique reservations per room
        const rawItems = itemsData.data || [];
        const reservationsMap = new Map();
        
        rawItems.forEach((item: CalendarReservationItem) => {
            const resInfo = item.reservation_id;
            if (resInfo) {
                const key = `${resInfo.id}_${item.room_id || 'unassigned'}`;
                if (!reservationsMap.has(key)) {
                    reservationsMap.set(key, {
                        id: resInfo.id,
                        check_in_date: resInfo.check_in_date,
                        check_out_date: resInfo.check_out_date,
                        status: resInfo.status,
                        guest_id: resInfo.guest_id,
                        room_id: item.room_id,
                        room_type_id: item.room_type_id,
                        locked_price: item.locked_price
                    });
                }
            }
        });
        const uniqueReservations = Array.from(reservationsMap.values());

        // Filter blocking tasks locally to avoid Directus schema sync issues with newly added MySQL fields
        // Fallback: If blocks_availability is entirely missing from payload, assume Maintenance tasks block availability.
        const blockingTasks = (rawTasksData.data || []).filter((t: { status?: string; blocks_availability?: number | boolean | string; task_type?: string; }) => {
            if (t.status === 'Completed') return false;
            
            if (t.blocks_availability !== undefined) {
                return t.blocks_availability === 1 || t.blocks_availability === true || t.blocks_availability === '1';
            }
            
            // Fallback for unsynced Directus fields
            return t.task_type && t.task_type.includes('Maintenance');
        });

        return NextResponse.json({
            data: {
                types: typesData.data || [],
                rooms: roomsData.data || [],
                statuses: statusesData.data || [],
                reservations: uniqueReservations,
                blockingTasks: blockingTasks,
            }
        });
    } catch (error) {
        console.error('Error fetching availability calendar data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
