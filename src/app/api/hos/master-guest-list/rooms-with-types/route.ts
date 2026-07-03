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

        const res = await fetch(`${API_BASE_URL}/items/rooms_hos?fields=id,room_number,type_id.id,type_id.name,type_id.price,operational_status_id,housekeeping_status_id`, {
            headers,
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch from Directus: ${res.statusText}`);
        }

        const data = await res.json();
        
        return NextResponse.json({ success: true, data: data.data || [] });
    } catch (error) {
        console.error('Error fetching rooms with types:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
