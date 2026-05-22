import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload, COOKIE_NAME } from '@/lib/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        if (!API_BASE_URL) return NextResponse.json({ error: 'Missing API config' }, { status: 500 });
        
        const params = await context.params;
        const taskId = params.id;
        
        if (!taskId) return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });

        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        let userId = null;
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload && payload.sub) userId = parseInt(payload.sub, 10);
        }

        const body = await request.json();
        const { status } = body;

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // 1. Fetch current task to know its type and room
        const taskRes = await fetch(`${API_BASE_URL}/items/housekeeping_tasks/${taskId}`, { headers });
        if (!taskRes.ok) throw new Error('Task not found');
        const taskData = await taskRes.json();
        const task = taskData.data;

        // 2. Prepare patch body
        const patchBody: any = { status, updated_by: userId };
        const now = new Date().toISOString();

        if (status === 'In Progress' && !task.start_time) {
            patchBody.start_time = now;
        }

        if (status === 'Completed' && !task.actual_completion_time) {
            patchBody.actual_completion_time = now;
        }

        // 3. Update the task
        const updateRes = await fetch(`${API_BASE_URL}/items/housekeeping_tasks/${taskId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(patchBody)
        });

        if (!updateRes.ok) throw new Error('Failed to update task');

        // 4. Side Effect: Update physical room if Checkout Clean is Completed
        if (status === 'Completed' && task.task_type === 'Checkout Clean' && task.room_id) {
            await fetch(`${API_BASE_URL}/items/rooms/${task.room_id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    housekeeping_status_id: 1, // Clean
                    updated_by: userId
                })
            }).catch(e => console.error("Failed to update room status:", e));
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
    }
}
