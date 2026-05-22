import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload, COOKIE_NAME } from '@/lib/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!API_BASE_URL) return NextResponse.json({ error: 'Missing API config' }, { status: 500 });
        const { id } = await params;
        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const fieldsQuery = `?fields=*,type_id.id,type_id.type_name`;
        
        const response = await fetch(`${API_BASE_URL}/items/rooms/${id}${fieldsQuery}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
            },
        });

        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!API_BASE_URL) return NextResponse.json({ error: 'Missing API config' }, { status: 500 });
        const { id } = await params;
        
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        let userId = null;
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload && payload.sub) userId = parseInt(payload.sub, 10);
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

        const payloadData = {
            ...body,
            updated_by: userId,
        };

        const response = await fetch(`${API_BASE_URL}/items/rooms/${id}`, {
            method: 'PATCH', // Directus uses PATCH for updates
            headers: {
                'Content-Type': 'application/json',
                ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
            },
            body: JSON.stringify(payloadData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Directus error:', errorData);
            return NextResponse.json({ error: 'Update failed', details: errorData }, { status: response.status });
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!API_BASE_URL) return NextResponse.json({ error: 'Missing API config' }, { status: 500 });
        const { id } = await params;
        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        
        const response = await fetch(`${API_BASE_URL}/items/rooms/${id}`, {
            method: 'DELETE',
            headers: {
                ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
            },
        });

        if (!response.ok) throw new Error('Delete failed');
        return new NextResponse(null, { status: 204 });
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
