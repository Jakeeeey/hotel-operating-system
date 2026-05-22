import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload, COOKIE_NAME } from '@/lib/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!API_BASE_URL) return NextResponse.json({ error: 'Missing API config' }, { status: 500 });
        const { id } = await params;
        
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        let userId = null;
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload?.sub) userId = parseInt(payload.sub, 10);
        }

        const body = await request.json();
        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        
        const response = await fetch(`${API_BASE_URL}/items/room_statuses/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
            },
            body: JSON.stringify({ ...body, updated_by: userId }),
        });

        if (!response.ok) throw new Error('Update failed');
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!API_BASE_URL) return NextResponse.json({ error: 'Missing API config' }, { status: 500 });
        const { id } = await params;
        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        
        const response = await fetch(`${API_BASE_URL}/items/room_statuses/${id}`, {
            method: 'DELETE',
            headers: {
                ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
            },
        });

        if (!response.ok) throw new Error('Delete failed');
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
