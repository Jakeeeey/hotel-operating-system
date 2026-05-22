import { NextResponse } from 'next/server';

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
        ] = await Promise.all([
            // 1. Room Types
            fetch(`${API_BASE_URL}/items/room_types?limit=-1&sort=id`, { headers }),
            // 2. Rooms (with operational status)
            fetch(`${API_BASE_URL}/items/rooms?limit=-1&sort=room_number&fields=id,room_number,floor_number,type_id,operational_status_id.id,operational_status_id.status_name,operational_status_id.ui_color_code`, { headers }),
            // 3. Operational Statuses
            fetch(`${API_BASE_URL}/items/operational_statuses?limit=-1`, { headers }),
            // 4. Reservation Items (within date range) with Joins
            fetch(`${API_BASE_URL}/items/reservation_items?limit=-1&fields=id,night_date,locked_price,room_id,room_type_id,reservation_id.id,reservation_id.status,reservation_id.check_in_date,reservation_id.check_out_date,reservation_id.guest_id.first_name,reservation_id.guest_id.last_name&filter=${encodeURIComponent(JSON.stringify({
                night_date: { _between: [start, end] }
            }))}`, { headers }),
        ]);

        if (!typesRes.ok || !roomsRes.ok || !statusesRes.ok || !itemsRes.ok) {
            throw new Error('Failed to fetch data from Directus.');
        }

        const typesData = await typesRes.json();
        const roomsData = await roomsRes.json();
        const statusesData = await statusesRes.json();
        const itemsData = await itemsRes.json();

        return NextResponse.json({
            data: {
                types: typesData.data || [],
                rooms: roomsData.data || [],
                statuses: statusesData.data || [],
                reservationItems: itemsData.data || [],
            }
        });
    } catch (error) {
        console.error('Error fetching availability calendar data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
