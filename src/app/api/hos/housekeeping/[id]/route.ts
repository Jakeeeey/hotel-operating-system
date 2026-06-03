import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload, COOKIE_NAME } from '@/lib/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        if (!API_BASE_URL) return NextResponse.json({ error: 'Missing API config' }, { status: 500 });
        
        const getManilaISOString = (d: Date = new Date()) => {
            const manilaDate = new Date(d.getTime() + 8 * 60 * 60 * 1000);
            return manilaDate.toISOString().replace('Z', '');
        };
        
        const addMinutesToManilaString = (manilaIso: string, minutes: number) => {
            const isZ = manilaIso.endsWith('Z');
            const d = new Date(manilaIso + (isZ ? '' : 'Z'));
            d.setMinutes(d.getMinutes() + minutes);
            return d.toISOString().replace('Z', '');
        };
        
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
        const { status, start_time: bodyStartTime } = body;

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // Handle virtual tasks (for rooms marked dirty without a physical task)
        if (taskId.startsWith('virtual-')) {
            const virtualRoomId = taskId.replace('virtual-', '');
            const now = getManilaISOString();
            
            if (status === 'Completed') {
                await fetch(`${API_BASE_URL}/items/rooms/${virtualRoomId}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({
                        housekeeping_status_id: 1, // Clean
                        updated_by: userId
                    })
                });
            } else if (status === 'In Progress') {
                const startTime = bodyStartTime || now;
                // Create a real task so it can be tracked as In Progress
                await fetch(`${API_BASE_URL}/items/housekeeping_tasks`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        room_id: virtualRoomId,
                        task_type: 'Checkout Clean',
                        task_description: 'Auto-generated cleaning task',
                        status: 'In Progress',
                        priority: 'Normal',
                        estimated_duration_minutes: 30,
                        start_time: startTime,
                        target_completion_time: addMinutesToManilaString(startTime, 30),
                        blocks_availability: 0,
                        created_by: userId,
                        updated_by: userId
                    })
                });
            }
            return NextResponse.json({ success: true, message: 'Virtual task handled' });
        }

        // 1. Fetch current task to know its type and room
        const taskRes = await fetch(`${API_BASE_URL}/items/housekeeping_tasks/${taskId}`, { headers });
        if (!taskRes.ok) throw new Error('Task not found');
        const taskData = await taskRes.json();
        const task = taskData.data;

        // 2. Prepare patch body
        const patchBody: Record<string, unknown> = { status, updated_by: userId };
        const now = getManilaISOString();

        if (status === 'In Progress') {
            const startTime = bodyStartTime || now;
            if (!task.start_time) {
                patchBody.start_time = startTime;
            }
            // Auto-calculate target_completion_time from start_time + estimated_duration_minutes
            if (!task.target_completion_time) {
                const durationMinutes = task.estimated_duration_minutes || 30;
                patchBody.target_completion_time = addMinutesToManilaString(task.start_time || startTime, durationMinutes);
            }
        }

        if (status === 'Completed') {
            if (!task.actual_completion_time) {
                patchBody.actual_completion_time = now;
            }
            // If target_completion_time was never set, calculate it retroactively
            if (!task.target_completion_time) {
                const durationMinutes = task.estimated_duration_minutes || 30;
                patchBody.target_completion_time = addMinutesToManilaString(task.start_time || now, durationMinutes);
            }
        }

        // 3. Update the task
        const updateRes = await fetch(`${API_BASE_URL}/items/housekeeping_tasks/${taskId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(patchBody)
        });

        if (!updateRes.ok) throw new Error('Failed to update task');

        // 4. Side Effect: Update physical room on task completion
        if (status === 'Completed' && task.room_id) {
            const isCritical = task.blocks_availability === 1 || task.blocks_availability === true;
            // OOO tickets revert to Dirty (2) instead of standard Clean (1)
            const targetStatus = isCritical ? 2 : 1; 

            await fetch(`${API_BASE_URL}/items/rooms/${task.room_id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    housekeeping_status_id: targetStatus,
                    updated_by: userId
                })
            }).catch(e => console.error("Failed to update room status:", e));
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Server Error' }, { status: 500 });
    }
}
