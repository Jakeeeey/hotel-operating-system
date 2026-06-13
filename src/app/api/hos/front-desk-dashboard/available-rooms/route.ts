import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function GET(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const roomTypeId = searchParams.get('roomTypeId');

        if (!roomTypeId) {
            return NextResponse.json({ error: 'roomTypeId is required.' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // Fetch rooms that are Vacant (1) and Clean (1) for the given type
        const filter = JSON.stringify({
            type_id: { _eq: roomTypeId },
            operational_status_id: { _eq: 1 },
            housekeeping_status_id: { _eq: 1 },
        });

        const response = await fetch(
            `${API_BASE_URL}/items/rooms_hos?limit=-1&fields=id,room_number,floor_number&filter=${encodeURIComponent(filter)}`,
            { headers }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch available rooms.');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching available rooms:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
