import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload, COOKIE_NAME } from '@/lib/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function POST(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        let userId = null;
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload && payload.sub) userId = parseInt(payload.sub, 10);
        }

        const { reservationId, roomId, depositAmount, depositMethod } = await request.json();

        if (!reservationId || !roomId) {
            return NextResponse.json({ error: 'reservationId and roomId are required.' }, { status: 400 });
        }

        if (!depositAmount || !depositMethod) {
            return NextResponse.json({ error: 'Incidental deposit amount and method are required.' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // 0. Clean Room Mandate & Early Check-In Attempt Validation
        const roomStatusRes = await fetch(`${API_BASE_URL}/items/rooms/${roomId}?fields=id,housekeeping_status_id`, { headers });
        if (roomStatusRes.ok) {
            const roomStatusData = await roomStatusRes.json();
            const hkStatus = roomStatusData.data?.housekeeping_status_id;
            if (hkStatus !== 1) { // 1 is Clean/Available
                return NextResponse.json({ error: 'Room not ready. Reassign room or await Housekeeping clearance.' }, { status: 400 });
            }
        }

        // 0b. Create Incidental Deposit Payment Record
        const depositPayload = {
            reservation_id: reservationId,
            amount: parseFloat(depositAmount),
            payment_method: depositMethod,
            reference_number: null,
            status: 'Completed',
            notes: 'Incidental Deposit Hold',
            payment_date: new Date().toISOString(),
            created_by: userId,
            updated_by: userId,
        };
        const depositRes = await fetch(`${API_BASE_URL}/items/payments_hos`, {
            method: 'POST',
            headers,
            body: JSON.stringify(depositPayload),
        });
        if (!depositRes.ok) {
            const err = await depositRes.json().catch(() => ({}));
            console.error('Failed to log incidental deposit:', err);
            return NextResponse.json({ error: 'Failed to record incidental deposit.' }, { status: 500 });
        }

        // 1. Update reservation status to "Checked-In"
        const resUpdate = await fetch(`${API_BASE_URL}/items/reservations/${reservationId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                status: 'Checked-In',
                updated_by: userId,
            }),
        });

        if (!resUpdate.ok) {
            const err = await resUpdate.json().catch(() => ({}));
            console.error('Failed to update reservation:', err);
            return NextResponse.json({ error: 'Failed to update reservation status.' }, { status: 500 });
        }

        // 2. Update reservation_items — assign room_id to all items of this reservation
        const itemsRes = await fetch(`${API_BASE_URL}/items/reservation_items?filter=${encodeURIComponent(JSON.stringify({
            reservation_id: { _eq: reservationId },
        }))}&fields=id`, { headers });

        if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            const items = itemsData.data || [];
            for (const item of items) {
                await fetch(`${API_BASE_URL}/items/reservation_items/${item.id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({
                        room_id: roomId,
                        updated_by: userId,
                    }),
                });
            }
        }

        // 3. Update room operational_status_id to 2 (Occupied)
        const roomUpdate = await fetch(`${API_BASE_URL}/items/rooms/${roomId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                operational_status_id: 2,
                updated_by: userId,
            }),
        });

        if (!roomUpdate.ok) {
            console.error('Failed to update room status');
        }

        return NextResponse.json({ success: true, message: 'Check-in completed successfully.' });
    } catch (error) {
        console.error('Error during check-in:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
