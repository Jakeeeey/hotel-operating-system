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

        // Fetch guests, reservations, rooms, and room types independently to bypass missing relation aliases
        const [guestsRes, reservationsRes, roomsRes, roomTypesRes] = await Promise.all([
            fetch(`${API_BASE_URL}/items/guests_hos?limit=-1`, { headers }),
            fetch(`${API_BASE_URL}/items/reservations?limit=-1&fields=*,reservation_items.*`, { headers }),
            fetch(`${API_BASE_URL}/items/rooms?limit=-1`, { headers }),
            fetch(`${API_BASE_URL}/items/room_types?limit=-1`, { headers })
        ]);

        if (!guestsRes.ok || !reservationsRes.ok || !roomsRes.ok || !roomTypesRes.ok) {
            const err1 = !guestsRes.ok ? await guestsRes.text() : null;
            const err2 = !reservationsRes.ok ? await reservationsRes.text() : null;
            const err3 = !roomsRes.ok ? await roomsRes.text() : null;
            const err4 = !roomTypesRes.ok ? await roomTypesRes.text() : null;
            console.error('API error:', err1, err2, err3, err4);
            throw new Error(`Failed to fetch data.`);
        }

        const guestsData = await guestsRes.json();
        const reservationsData = await reservationsRes.json();
        const roomsData = await roomsRes.json();
        const roomTypesData = await roomTypesRes.json();

        const guests = guestsData.data || [];
        const reservations = reservationsData.data || [];
        const rooms = roomsData.data || [];
        const roomTypes = roomTypesData.data || [];

        // Stitch rooms and room_types into reservation_items
        const enrichedReservations = reservations.map((r: any) => {
            const items = r.reservation_items || [];
            const enrichedItems = items.map((item: any) => {
                // Find room
                const roomId = typeof item.room_id === 'object' && item.room_id !== null ? item.room_id.id : item.room_id;
                const foundRoom = rooms.find((room: any) => room.id === roomId);
                
                // Find room type (fallback to room's type_id if reservation_items doesn't explicitly have it, though it usually should)
                const roomTypeId = typeof item.room_type_id === 'object' && item.room_type_id !== null 
                    ? item.room_type_id.id 
                    : (item.room_type_id || (foundRoom ? foundRoom.type_id : null));
                
                const foundType = roomTypes.find((t: any) => t.id === roomTypeId);

                return {
                    ...item,
                    room_id: foundRoom ? { id: foundRoom.id, room_number: foundRoom.room_number } : item.room_id,
                    room_type_id: foundType ? { id: foundType.id, type_name: foundType.type_name } : item.room_type_id
                };
            });

            return {
                ...r,
                reservation_items: enrichedItems
            };
        });

        // Manually stitch reservations into their corresponding guests
        const guestsWithReservations = guests.map((guest: any) => {
            const guestReservations = enrichedReservations.filter((r: any) => {
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
