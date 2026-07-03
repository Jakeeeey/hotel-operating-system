import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function GET(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const reservationId = searchParams.get('reservationId');

        if (!reservationId) {
            return NextResponse.json({ error: 'Missing reservationId.' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // Fetch reservation details
        const reservationRes = await fetch(
            `${API_BASE_URL}/items/reservations_hos/${reservationId}?fields=id,status,check_in,check_out,total_amount,booking_source,guest_id.first_name,guest_id.last_name,guest_id.email,guest_id.contact_number`,
            { headers }
        );

        if (!reservationRes.ok) {
            console.error('Failed to fetch reservation:', await reservationRes.text());
            return NextResponse.json({ error: 'Failed to fetch reservation.' }, { status: 404 });
        }

        const reservationJson = await reservationRes.json();
        const resData = reservationJson.data;

        // Fetch reservation items for room info
        const itemsRes = await fetch(
            `${API_BASE_URL}/items/reservation_items_hos?limit=-1&fields=night_date,adults_count,children_count,room_id.id,room_id.room_number,room_id.type_id.id,room_id.type_id.name&filter=${encodeURIComponent(JSON.stringify({ reservation_id: { _eq: reservationId } }))}`,
            { headers }
        );

        let itemsData = [];
        if (itemsRes.ok) {
            const itemsJson = await itemsRes.json();
            itemsData = itemsJson.data || [];
        }

        const firstItem = itemsData[0] || {};
        
        // Calculate nights
        const nights = new Set(itemsData.map((item: any) => item.night_date)).size;

        const data = {
            reservationId: resData.id,
            status: resData.status,
            checkIn: resData.check_in,
            checkOut: resData.check_out,
            totalAmount: resData.total_amount,
            bookingSource: resData.booking_source,
            guest: {
                firstName: resData.guest_id?.first_name || '',
                lastName: resData.guest_id?.last_name || '',
                email: resData.guest_id?.email || '',
                contactNumber: resData.guest_id?.contact_number || '',
            },
            roomTypeName: firstItem.room_id?.type_id?.name || 'N/A',
            roomTypeId: firstItem.room_id?.type_id?.id || null,
            roomId: firstItem.room_id?.id || null,
            roomNumber: firstItem.room_id?.room_number || 'Unassigned',
            nights: nights || 0,
            adultsCount: firstItem.adults_count || 1,
            childrenCount: firstItem.children_count || 0,
        };

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error fetching reservation details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
