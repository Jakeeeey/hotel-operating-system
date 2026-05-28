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

        // Fetch guests and reservations independently to bypass missing relation aliases
        const [guestsRes, reservationsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/items/guests_hos?limit=-1`, { headers }),
            fetch(`${API_BASE_URL}/items/reservations?limit=-1&fields=*,reservation_items.*,reservation_items.room_id.room_number`, { headers })
        ]);

        if (!guestsRes.ok || !reservationsRes.ok) {
            const err1 = !guestsRes.ok ? await guestsRes.text() : null;
            const err2 = !reservationsRes.ok ? await reservationsRes.text() : null;
            console.error('API error:', err1, err2);
            throw new Error(`Failed to fetch data. GuestsErr: ${err1}, ResErr: ${err2}`);
        }

        const guestsData = await guestsRes.json();
        const reservationsData = await reservationsRes.json();

        const guests = guestsData.data || [];
        const reservations = reservationsData.data || [];

        // Manually stitch reservations into their corresponding guests
        const guestsWithReservations = guests.map((guest: any) => {
            const guestReservations = reservations.filter((r: any) => {
                const rGuestId = typeof r.guest_id === 'object' && r.guest_id !== null ? r.guest_id.id : r.guest_id;
                return rGuestId === guest.id;
            });
            return {
                ...guest,
                reservations: guestReservations
            };
        });

        // Sort guests by created_at descending (most recent first)
        guestsWithReservations.sort((a: any, b: any) => {
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
        
        return NextResponse.json({
            data: guestsWithReservations
        });
    } catch (error) {
        console.error('Error fetching master guest list:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
