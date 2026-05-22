import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload, COOKIE_NAME } from '@/lib/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function GET() {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        const today = new Date().toISOString().split('T')[0];

        // --- Parallel fetch: stats + arrivals + departures ---
        const [
            totalRoomsRes,
            occupiedRoomsRes,
            arrivalsRes,
            departuresRes,
        ] = await Promise.all([
            // 1. Total rooms count
            fetch(`${API_BASE_URL}/items/rooms?limit=-1&fields=id`, { headers }),
            // 2. Occupied rooms (operational_status_id = 2)
            fetch(`${API_BASE_URL}/items/rooms?limit=-1&fields=id&filter=${encodeURIComponent(JSON.stringify({ operational_status_id: { _eq: 2 } }))}`, { headers }),
            // 3. Today's arrivals (Pending or Checked-In)
            fetch(`${API_BASE_URL}/items/reservations?limit=-1&fields=id,status,guest_id.id,guest_id.first_name,guest_id.last_name&filter=${encodeURIComponent(JSON.stringify({
                check_in_date: { _eq: today },
                status: { _in: ['Pending', 'Checked-In'] },
            }))}`, { headers }),
            // 4. Today's departures (Checked-In only — guests who can check out)
            fetch(`${API_BASE_URL}/items/reservations?limit=-1&fields=id,status,guest_id.id,guest_id.first_name,guest_id.last_name&filter=${encodeURIComponent(JSON.stringify({
                check_out_date: { _eq: today },
                status: { _in: ['Checked-In', 'Checked-Out'] },
            }))}`, { headers }),
        ]);

        if (!totalRoomsRes.ok || !occupiedRoomsRes.ok || !arrivalsRes.ok || !departuresRes.ok) {
            throw new Error('One or more upstream fetches failed.');
        }

        const totalRoomsData = await totalRoomsRes.json();
        const occupiedRoomsData = await occupiedRoomsRes.json();
        const arrivalsData = await arrivalsRes.json();
        const departuresData = await departuresRes.json();

        const totalRooms = totalRoomsData.data?.length || 0;
        const occupiedRooms = occupiedRoomsData.data?.length || 0;
        const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        const arrivalsList = arrivalsData.data || [];
        const departuresList = departuresData.data || [];

        const pendingArrivals = arrivalsList.filter((r: any) => r.status === 'Pending').length;
        const totalArrivals = arrivalsList.length;

        const pendingDepartures = departuresList.filter((r: any) => r.status === 'Checked-In').length;
        const totalDepartures = departuresList.length;
        const completedCheckouts = departuresList.filter((r: any) => r.status === 'Checked-Out').length;

        // --- Fetch reservation_items for arrivals & departures to get room/type info ---
        const allReservationIds = [
            ...arrivalsList.map((r: any) => r.id),
            ...departuresList.filter((r: any) => r.status === 'Checked-In').map((r: any) => r.id),
        ];

        let itemsMap: Record<number, any[]> = {};
        if (allReservationIds.length > 0) {
            const itemsRes = await fetch(`${API_BASE_URL}/items/reservation_items?limit=-1&fields=id,reservation_id,room_type_id.id,room_type_id.type_name,room_id.id,room_id.room_number&filter=${encodeURIComponent(JSON.stringify({
                reservation_id: { _in: allReservationIds },
            }))}`, { headers });

            if (itemsRes.ok) {
                const itemsData = await itemsRes.json();
                const items = itemsData.data || [];
                for (const item of items) {
                    const resId = item.reservation_id;
                    if (!itemsMap[resId]) itemsMap[resId] = [];
                    itemsMap[resId].push(item);
                }
            }
        }

        // --- Build arrivals response ---
        const arrivals = arrivalsList.map((r: any) => {
            const items = itemsMap[r.id] || [];
            const firstItem = items[0];
            return {
                reservationId: r.id,
                guestName: `${r.guest_id?.first_name || ''} ${r.guest_id?.last_name || ''}`.trim(),
                roomTypeName: firstItem?.room_type_id?.type_name || 'N/A',
                roomTypeId: firstItem?.room_type_id?.id || null,
                status: r.status,
                roomId: firstItem?.room_id?.id || null,
                roomNumber: firstItem?.room_id?.room_number || null,
            };
        });

        // --- Build departures response (only Checked-In for action, but include Checked-Out for count) ---
        const departures = departuresList
            .filter((r: any) => r.status === 'Checked-In')
            .map((r: any) => {
                const items = itemsMap[r.id] || [];
                const firstItem = items[0];
                return {
                    reservationId: r.id,
                    guestName: `${r.guest_id?.first_name || ''} ${r.guest_id?.last_name || ''}`.trim(),
                    roomNumber: firstItem?.room_id?.room_number || 'N/A',
                    roomId: firstItem?.room_id?.id || null,
                    roomTypeName: firstItem?.room_type_id?.type_name || '',
                    status: r.status,
                };
            });

        return NextResponse.json({
            data: {
                stats: {
                    totalRooms,
                    occupiedRooms,
                    occupancyPercent,
                    pendingArrivals,
                    totalArrivals,
                    pendingDepartures,
                    totalDepartures,
                    completedCheckouts,
                },
                arrivals,
                departures,
            },
        });
    } catch (error) {
        console.error('Error fetching front desk dashboard:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
