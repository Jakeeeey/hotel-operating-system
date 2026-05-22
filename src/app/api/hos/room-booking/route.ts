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

        const body = await request.json();
        const {
            guest,
            check_in_date,
            check_out_date,
            booking_source,
            room_type_id,
            room_id,
            is_walk_in,
        } = body;

        // Validate required fields
        if (!guest?.first_name || !guest?.last_name || !check_in_date || !check_out_date || !room_type_id) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        if (is_walk_in && !room_id) {
            return NextResponse.json({ error: 'Walk-in bookings require a room assignment.' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // ──────────────────────────────────────────────
        // 1. GUEST — lookup by email or create new
        // ──────────────────────────────────────────────
        let guestId: number | null = null;

        if (guest.email) {
            // Try to find existing guest by email
            const lookupRes = await fetch(
                `${API_BASE_URL}/items/guests?filter=${encodeURIComponent(JSON.stringify({ email: { _eq: guest.email } }))}&fields=id&limit=1`,
                { headers }
            );
            if (lookupRes.ok) {
                const lookupData = await lookupRes.json();
                if (lookupData.data && lookupData.data.length > 0) {
                    guestId = lookupData.data[0].id;
                }
            }
        }

        if (!guestId) {
            // Create new guest
            const guestPayload: Record<string, unknown> = {
                first_name: guest.first_name,
                last_name: guest.last_name,
                created_by: userId,
                updated_by: userId,
            };
            if (guest.email) guestPayload.email = guest.email;
            if (guest.phone_number) guestPayload.phone_number = guest.phone_number;
            if (guest.id_passport_number) guestPayload.id_passport_number = guest.id_passport_number;

            const createGuestRes = await fetch(`${API_BASE_URL}/items/guests`, {
                method: 'POST',
                headers,
                body: JSON.stringify(guestPayload),
            });

            if (!createGuestRes.ok) {
                const err = await createGuestRes.json().catch(() => ({}));
                console.error('Failed to create guest:', err);
                return NextResponse.json({ error: 'Failed to create guest.', details: err }, { status: 500 });
            }

            const createdGuest = await createGuestRes.json();
            guestId = createdGuest.data?.id;
        }

        if (!guestId) {
            return NextResponse.json({ error: 'Failed to resolve guest.' }, { status: 500 });
        }

        // ──────────────────────────────────────────────
        // 2. Fetch room type base_price for locked_price
        // ──────────────────────────────────────────────
        const typeRes = await fetch(`${API_BASE_URL}/items/room_types/${room_type_id}?fields=id,base_price`, { headers });
        if (!typeRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch room type.' }, { status: 500 });
        }
        const typeData = await typeRes.json();
        const basePrice = parseFloat(typeData.data?.base_price) || 0;

        // ──────────────────────────────────────────────
        // 3. Calculate nights
        // ──────────────────────────────────────────────
        const startDate = new Date(check_in_date);
        const endDate = new Date(check_out_date);
        const nightDates: string[] = [];

        const current = new Date(startDate);
        while (current < endDate) {
            nightDates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }

        if (nightDates.length === 0) {
            return NextResponse.json({ error: 'Check-out must be after check-in.' }, { status: 400 });
        }

        const totalAmount = basePrice * nightDates.length;

        // ──────────────────────────────────────────────
        // 4. RESERVATION — create header
        // ──────────────────────────────────────────────
        const reservationPayload = {
            guest_id: guestId,
            check_in_date,
            check_out_date,
            booking_source: booking_source || (is_walk_in ? 'Walk-In' : 'Website'),
            total_amount: totalAmount,
            status: is_walk_in ? 'Checked-In' : 'Pending',
            created_by: userId,
            updated_by: userId,
        };

        const resCreate = await fetch(`${API_BASE_URL}/items/reservations`, {
            method: 'POST',
            headers,
            body: JSON.stringify(reservationPayload),
        });

        if (!resCreate.ok) {
            const err = await resCreate.json().catch(() => ({}));
            console.error('Failed to create reservation:', err);
            return NextResponse.json({ error: 'Failed to create reservation.', details: err }, { status: 500 });
        }

        const createdRes = await resCreate.json();
        const reservationId = createdRes.data?.id;

        // ──────────────────────────────────────────────
        // 5. RESERVATION ITEMS — one per night
        // ──────────────────────────────────────────────
        const itemPayloads = nightDates.map((nightDate) => ({
            reservation_id: reservationId,
            room_type_id,
            room_id: room_id || null,
            night_date: nightDate,
            locked_price: basePrice,
            created_by: userId,
            updated_by: userId,
        }));

        // Bulk create items
        const itemsCreate = await fetch(`${API_BASE_URL}/items/reservation_items`, {
            method: 'POST',
            headers,
            body: JSON.stringify(itemPayloads),
        });

        if (!itemsCreate.ok) {
            console.error('Failed to create reservation items');
        }

        // ──────────────────────────────────────────────
        // 6. ROOM UPDATE — Walk-In only: set to Occupied
        // ──────────────────────────────────────────────
        if (is_walk_in && room_id) {
            const roomUpdate = await fetch(`${API_BASE_URL}/items/rooms/${room_id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    operational_status_id: 2, // Occupied
                    updated_by: userId,
                }),
            });

            if (!roomUpdate.ok) {
                console.error('Failed to update room status to Occupied');
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                reservationId,
                guestId,
                nights: nightDates.length,
                totalAmount,
            },
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
