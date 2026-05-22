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

        const { reservationId, roomId } = await request.json();

        if (!reservationId || !roomId) {
            return NextResponse.json({ error: 'reservationId and roomId are required.' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // 1. Update reservation status to "Checked-Out"
        const resUpdate = await fetch(`${API_BASE_URL}/items/reservations/${reservationId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                status: 'Checked-Out',
                updated_by: userId,
            }),
        });

        if (!resUpdate.ok) {
            const err = await resUpdate.json().catch(() => ({}));
            console.error('Failed to update reservation:', err);
            return NextResponse.json({ error: 'Failed to update reservation status.' }, { status: 500 });
        }

        // 2. Update room: operational_status_id = 1 (Vacant), housekeeping_status_id = 2 (Dirty)
        const roomUpdate = await fetch(`${API_BASE_URL}/items/rooms/${roomId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                operational_status_id: 1,
                housekeeping_status_id: 2,
                updated_by: userId,
            }),
        });

        if (!roomUpdate.ok) {
            console.error('Failed to update room status');
        }

        // 3. Create housekeeping task
        const taskCreate = await fetch(`${API_BASE_URL}/items/housekeeping_tasks`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                room_id: roomId,
                task_type: 'Checkout Clean',
                task_description: `Checkout cleaning required for room after guest departure.`,
                status: 'Pending',
                priority: 'Normal',
                created_by: userId,
                updated_by: userId,
            }),
        });

        if (!taskCreate.ok) {
            console.error('Failed to create housekeeping task');
        }

        return NextResponse.json({ success: true, message: 'Check-out completed successfully.' });
    } catch (error) {
        console.error('Error during check-out:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
