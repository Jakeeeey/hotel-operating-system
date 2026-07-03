import { NextResponse } from 'next/server';

interface RawGuest extends Record<string, unknown> {
    id: string | number;
    created_at?: string;
}

interface RawRoom extends Record<string, unknown> {
    id: string | number;
    room_number: string;
    type_id: string | number | null;
}

interface RawRoomType extends Record<string, unknown> {
    id: string | number;
    name: string;
}

interface RawReservationItem extends Record<string, unknown> {
    id: string | number;
    room_id: string | number | { id: string | number; room_number: string } | null;
    reservation_id: string | number | { id: string | number } | null;
}

interface RawReservation extends Record<string, unknown> {
    id: string | number;
    guest_id: string | number | { id: string | number } | null;
    check_in: string;
    check_out: string;
    reservation_items?: RawReservationItem[];
}

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

        // Fetch all 5 tables independently to completely bypass Directus nested relation bugs
        const [guestsRes, reservationsRes, reservationItemsRes, roomsRes, roomTypesRes] = await Promise.all([
            fetch(`${API_BASE_URL}/items/guests_hos?limit=-1`, { headers }),
            fetch(`${API_BASE_URL}/items/reservations_hos?limit=-1`, { headers }),
            fetch(`${API_BASE_URL}/items/reservation_items_hos?limit=-1`, { headers }),
            fetch(`${API_BASE_URL}/items/rooms_hos?limit=-1`, { headers }),
            fetch(`${API_BASE_URL}/items/room_types_hos?limit=-1`, { headers })
        ]);

        if (!guestsRes.ok || !reservationsRes.ok || !reservationItemsRes.ok || !roomsRes.ok || !roomTypesRes.ok) {
            const err1 = !guestsRes.ok ? await guestsRes.text() : null;
            const err2 = !reservationsRes.ok ? await reservationsRes.text() : null;
            const err3 = !reservationItemsRes.ok ? await reservationItemsRes.text() : null;
            const err4 = !roomsRes.ok ? await roomsRes.text() : null;
            const err5 = !roomTypesRes.ok ? await roomTypesRes.text() : null;
            console.error('API error:', err1, err2, err3, err4, err5);
            throw new Error(`Failed to fetch data.`);
        }

        const guestsData = await guestsRes.json();
        const reservationsData = await reservationsRes.json();
        const reservationItemsData = await reservationItemsRes.json();
        const roomsData = await roomsRes.json();
        const roomTypesData = await roomTypesRes.json();

        const guests = (guestsData.data || []) as RawGuest[];
        const reservations = (reservationsData.data || []) as RawReservation[];
        const reservationItems = (reservationItemsData.data || []) as RawReservationItem[];
        const rooms = (roomsData.data || []) as RawRoom[];
        const roomTypes = (roomTypesData.data || []) as RawRoomType[];

        // 1. Stitch rooms and room_types into reservation_items
        const enrichedReservationItems = reservationItems.map((item: RawReservationItem) => {
            const roomId = typeof item.room_id === 'object' && item.room_id !== null ? (item.room_id as { id: string | number }).id : item.room_id;
            const foundRoom = rooms.find((room: RawRoom) => room.id === roomId);
            
            const roomTypeId = foundRoom ? foundRoom.type_id : null;
            const foundType = roomTypes.find((t: RawRoomType) => t.id === roomTypeId);

            return {
                ...item,
                room_id: foundRoom ? { id: foundRoom.id, room_number: foundRoom.room_number } : item.room_id,
                room_type_id: foundType ? { id: foundType.id, name: foundType.name } : null
            } as unknown as RawReservationItem;
        });

        // 2. Stitch enriched reservation_items into reservations
        const enrichedReservations = reservations.map((r: RawReservation) => {
            const rId = typeof r.id === 'object' && r.id !== null ? (r.id as { id: string | number }).id : r.id;
            const itemsForRes = enrichedReservationItems.filter((item: RawReservationItem) => {
                const itemResId = typeof item.reservation_id === 'object' && item.reservation_id !== null ? (item.reservation_id as { id: string | number }).id : item.reservation_id;
                return itemResId === rId;
            });
            return {
                ...r,
                reservation_items: itemsForRes
            } as RawReservation;
        });

        // 3. Manually stitch enriched reservations into their corresponding guests
        const guestsWithReservations = guests.map((guest: RawGuest) => {
            const guestReservations = enrichedReservations.filter((r: RawReservation) => {
                const rGuestId = typeof r.guest_id === 'object' && r.guest_id !== null ? (r.guest_id as { id: string | number }).id : r.guest_id;
                return rGuestId === guest.id;
            });
            return {
                ...guest,
                reservations: guestReservations
            };
        });

        // Sort guests by created_at descending (most recent first)
        guestsWithReservations.sort((a, b) => {
            const dateB = typeof b.created_at === 'string' ? b.created_at : '';
            const dateA = typeof a.created_at === 'string' ? a.created_at : '';
            return new Date(dateB || 0).getTime() - new Date(dateA || 0).getTime();
        });
        
        return NextResponse.json({
            data: guestsWithReservations
        });
    } catch (error) {
        console.error('Error fetching master guest list:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
