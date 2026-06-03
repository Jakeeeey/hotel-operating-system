import { NextResponse } from 'next/server';

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

        const getManilaDateString = (d: Date = new Date()) => {
            const manilaDate = new Date(d.getTime() + 8 * 60 * 60 * 1000);
            return manilaDate.toISOString().replace('Z', '').split('T')[0];
        };
        const today = getManilaDateString();

        // --- Parallel fetch: stats + arrivals + departures ---
        const [
            totalRoomsRes,
            availableRoomsRes,
            arrivalsRes,
            departuresRes,
        ] = await Promise.all([
            // 1. Total rooms count
            fetch(`${API_BASE_URL}/items/rooms?limit=-1&fields=id`, { headers }),
            // 2. Available rooms (operational_status_id = 1 AND housekeeping_status_id = 1)
            fetch(`${API_BASE_URL}/items/rooms?limit=-1&fields=id&filter=${encodeURIComponent(JSON.stringify({ operational_status_id: { _eq: 1 }, housekeeping_status_id: { _eq: 1 } }))}`, { headers }),
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

        if (!totalRoomsRes.ok || !availableRoomsRes.ok || !arrivalsRes.ok || !departuresRes.ok) {
            throw new Error('One or more upstream fetches failed.');
        }

        const totalRoomsData = await totalRoomsRes.json();
        const availableRoomsData = await availableRoomsRes.json();
        const arrivalsData = await arrivalsRes.json();
        const departuresData = await departuresRes.json();

        const totalRooms = totalRoomsData.data?.length || 0;
        const availableRooms = availableRoomsData.data?.length || 0;

        const arrivalsList = arrivalsData.data || [];
        const departuresList = departuresData.data || [];

        const pendingArrivals = arrivalsList.filter((r: { status: string }) => r.status === 'Pending').length;
        const totalArrivals = arrivalsList.length;

        const pendingDepartures = departuresList.filter((r: { status: string }) => r.status === 'Checked-In').length;
        const totalDepartures = departuresList.length;
        const completedCheckouts = departuresList.filter((r: { status: string }) => r.status === 'Checked-Out').length;

        // --- Fetch reservation_items for arrivals & departures to get room/type info ---
        const allReservationIds = [
            ...arrivalsList.map((r: { id: number }) => r.id),
            ...departuresList.filter((r: { status: string; id: number }) => r.status === 'Checked-In').map((r: { id: number }) => r.id),
        ];

        const itemsMap: Record<number, { reservation_id: number; room_type_id?: { id?: number; type_name?: string }; room_id?: { id?: number; room_number?: string; housekeeping_status_id?: number } }[]> = {};
        if (allReservationIds.length > 0) {
            const itemsRes = await fetch(`${API_BASE_URL}/items/reservation_items?limit=-1&fields=id,reservation_id,room_type_id.id,room_type_id.type_name,room_id.id,room_id.room_number,room_id.housekeeping_status_id&filter=${encodeURIComponent(JSON.stringify({
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
        const arrivals = arrivalsList.map((r: { id: number; status: string; guest_id?: { first_name?: string; last_name?: string } }) => {
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
                roomHousekeepingStatusId: firstItem?.room_id?.housekeeping_status_id || null,
            };
        });

        // --- Build departures response (only Checked-In for action, but include Checked-Out for count) ---
        const departures = departuresList
            .filter((r: { status: string }) => r.status === 'Checked-In')
            .map((r: { id: number; status: string; guest_id?: { first_name?: string; last_name?: string } }) => {
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
                    availableRooms,
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
