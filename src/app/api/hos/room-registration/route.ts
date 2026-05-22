import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload, COOKIE_NAME } from '@/lib/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function GET(request: Request) {
    try {
        if (!API_BASE_URL) {
            console.warn('API_BASE_URL is not defined in environment variables.');
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const floor = searchParams.get('floor');
        const status = searchParams.get('status');
        const type = searchParams.get('type');

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        
        let filter: any = {};
        if (floor) filter.floor_number = { _eq: floor };
        if (status) filter.status_id = { _eq: status };
        if (type) filter.type_id = { _eq: type };

        const filterQuery = Object.keys(filter).length > 0 ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : '';
        const fieldsQuery = `&fields=*,type_id.id,type_id.type_name,status_id.id,status_id.status_name,status_id.ui_color_code`;

        const response = await fetch(`${API_BASE_URL}/items/rooms?limit=-1${fieldsQuery}${filterQuery}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch rooms. Status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        // Get user info from cookie
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        let userId = null;
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload && payload.sub) {
                userId = parseInt(payload.sub, 10);
            }
        }

        const body = await request.json();
        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;

        // Construct payload with created_by
        const payloadData = {
            ...body,
            created_by: userId,
            updated_by: userId,
        };

        const response = await fetch(`${API_BASE_URL}/items/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
            },
            body: JSON.stringify(payloadData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Directus error:', errorData);
            return NextResponse.json({ error: 'Failed to create room.' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating room:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
