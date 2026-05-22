import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function GET(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email || !email.trim()) {
            return NextResponse.json({ found: false, data: null });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        const filter = JSON.stringify({ email: { _eq: email.trim() } });
        const response = await fetch(
            `${API_BASE_URL}/items/guests?filter=${encodeURIComponent(filter)}&fields=id,first_name,last_name,email,phone_number,id_passport_number&limit=1`,
            { headers }
        );

        if (!response.ok) {
            throw new Error('Failed to lookup guest.');
        }

        const data = await response.json();
        const guests = data.data || [];

        if (guests.length > 0) {
            return NextResponse.json({ found: true, data: guests[0] });
        }

        return NextResponse.json({ found: false, data: null });
    } catch (error) {
        console.error('Error looking up guest:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
