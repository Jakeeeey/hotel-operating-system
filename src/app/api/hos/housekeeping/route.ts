import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload, COOKIE_NAME } from '@/lib/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function GET(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Fetch tasks and rooms in parallel
        const [tasksRes, roomsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/items/housekeeping_tasks?limit=-1&fields=*,room_id.id,room_id.room_number,room_id.operational_status_id.status_name`, { headers }),
            fetch(`${API_BASE_URL}/items/rooms?limit=-1&fields=id,housekeeping_status_id.id`, { headers })
        ]);

        if (!tasksRes.ok || !roomsRes.ok) {
            const taskErr = !tasksRes.ok ? await tasksRes.text() : null;
            const roomErr = !roomsRes.ok ? await roomsRes.text() : null;
            console.error('Task error:', taskErr);
            console.error('Room error:', roomErr);
            throw new Error(`Failed to fetch data. TaskErr: ${taskErr}, RoomErr: ${roomErr}`);
        }

        const tasksData = await tasksRes.json();
        const roomsData = await roomsRes.json();

        const tasks = tasksData.data || [];
        const rooms = roomsData.data || [];

        // Calculate Stats
        const dirtyRooms = rooms.filter((r: any) => r.housekeeping_status_id?.id === 2).length;
        
        const inProgress = tasks.filter((t: any) => 
            t.status === 'In Progress' || t.status === 'Inspecting'
        ).length;

        const cleanedToday = tasks.filter((t: any) => {
            if (t.status !== 'Completed' || !t.actual_completion_time) return false;
            const completionDate = new Date(t.actual_completion_time);
            return completionDate >= todayStart;
        }).length;

        return NextResponse.json({
            data: {
                stats: {
                    dirtyRooms,
                    inProgress,
                    cleanedToday
                },
                tasks: tasks
            }
        });
    } catch (error) {
        console.error('Error fetching housekeeping data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!API_BASE_URL) return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });

        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        let userId = null;
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload && payload.sub) userId = parseInt(payload.sub, 10);
        }

        const body = await request.json();
        const { room_id, task_type, task_description, priority, estimated_duration_minutes, target_completion_time, blocks_availability } = body;

        if (!room_id || !task_type) {
            return NextResponse.json({ error: 'room_id and task_type are required' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        const newTask = {
            room_id,
            task_type,
            task_description,
            status: 'Pending',
            priority: priority || 'Normal',
            estimated_duration_minutes: estimated_duration_minutes || 30,
            target_completion_time: target_completion_time || null,
            blocks_availability: blocks_availability ? 1 : 0,
            created_by: userId,
            updated_by: userId
        };

        const res = await fetch(`${API_BASE_URL}/items/housekeeping_tasks`, {
            method: 'POST',
            headers,
            body: JSON.stringify(newTask)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create task');
        }

        const created = await res.json();
        return NextResponse.json({ success: true, data: created.data });
    } catch (error: any) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
    }
}
