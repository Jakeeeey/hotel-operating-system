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
        const type = searchParams.get('type');

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        
        const filter: Record<string, unknown> = {};
        if (floor) filter.floor_number = { _eq: floor };
        if (type) filter.type_id = { _eq: type };

        const filterQuery = Object.keys(filter).length > 0 ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : '';
        const fieldsQuery = `&fields=*,type_id.id,type_id.name`;

        const response = await fetch(`${API_BASE_URL}/items/rooms_hos?limit=-1${fieldsQuery}${filterQuery}`, {
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

        if (body.main_image_url && body.main_image_url.startsWith('data:image')) {
            try {
                const matches = body.main_image_url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const type = matches[1];
                    const data = Buffer.from(matches[2], 'base64');
                    const blob = new Blob([data], { type });
                    const formData = new FormData();
                    formData.append('file', blob, `room_img_${Date.now()}.${type.split('/')[1] || 'png'}`);

                    const fileRes = await fetch(`${API_BASE_URL}/files`, {
                        method: 'POST',
                        headers: {
                            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
                        },
                        body: formData
                    });
                    
                    if (fileRes.ok) {
                        const fileData = await fileRes.json();
                        if (fileData?.data?.id) {
                            body.main_image_url = fileData.data.id;
                        } else {
                            body.main_image_url = null;
                        }
                    } else {
                        body.main_image_url = null;
                    }
                }
            } catch (err) {
                console.error("Failed to upload image to Directus", err);
                body.main_image_url = null;
            }
        }

        // Construct payload with created_by
        const payloadData = {
            ...body,
            created_by: userId,
            updated_by: userId,
        };

        const response = await fetch(`${API_BASE_URL}/items/rooms_hos`, {
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
            return NextResponse.json({ error: 'Failed to create room.', details: errorData }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating room:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
