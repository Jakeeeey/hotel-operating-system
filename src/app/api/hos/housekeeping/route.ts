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
            fetch(`${API_BASE_URL}/items/housekeeping_tasks?limit=-1&fields=*,room_id.*`, { headers }),
            fetch(`${API_BASE_URL}/items/rooms?limit=-1&fields=id,room_number,housekeeping_status_id.id`, { headers })
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
        const dirtyRoomsList = rooms.filter((r: any) => r.housekeeping_status_id?.id === 2 || r.housekeeping_status_id === 2);
        const dirtyRooms = dirtyRoomsList.length;
        
        const inProgress = tasks.filter((t: any) => 
            t.status === 'In Progress' || t.status === 'Inspecting'
        ).length;

        const cleanedToday = tasks.filter((t: any) => {
            if (t.status !== 'Completed' || !t.actual_completion_time) return false;
            const completionDate = new Date(t.actual_completion_time);
            return completionDate >= todayStart;
        }).length;

        // Auto-inject virtual tasks for dirty rooms missing a task
        const pendingOrActiveTasks = tasks.filter((t: any) => t.status !== 'Completed');
        dirtyRoomsList.forEach((room: any) => {
            const hasTask = pendingOrActiveTasks.some((t: any) => t.room_id?.id === room.id || t.room_id === room.id);
            if (!hasTask) {
                tasks.unshift({
                    id: `virtual-${room.id}`,
                    room_id: {
                        id: room.id,
                        room_number: room.room_number,
                        operational_status_id: room.operational_status_id
                    },
                    task_type: 'Checkout Clean (Auto)',
                    task_description: 'Room is marked dirty but has no active task. Needs cleaning.',
                    status: 'Pending',
                    priority: 'Normal',
                    estimated_duration_minutes: 30,
                    blocks_availability: 0,
                    created_at: new Date().toISOString()
                });
            }
        });

        // Sort tasks descending by created_at
        tasks.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

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

        const body = await request.json();
        const { room_number, task_type, task_description, priority, estimated_duration_minutes, target_completion_time, blocks_availability } = body;

        if (!room_number || !task_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        let userId = null;
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload && payload.sub) userId = parseInt(payload.sub, 10);
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // Lookup room_id from room_number
        const roomRes = await fetch(`${API_BASE_URL}/items/rooms?filter[room_number][_eq]=${encodeURIComponent(room_number)}`, { headers });
        if (!roomRes.ok) throw new Error('Failed to find room');
        const roomData = await roomRes.json();
        if (!roomData.data || roomData.data.length === 0) {
            return NextResponse.json({ error: `Room number ${room_number} not found` }, { status: 404 });
        }
        const room_id = roomData.data[0].id;

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
            const errBody = await res.text();
            console.error('Directus POST Error:', errBody);
            
            let parsedErr;
            try { parsedErr = JSON.parse(errBody); } catch (e) {}
            
            const errMsg = parsedErr?.errors?.[0]?.message || parsedErr?.error || errBody || 'Failed to create task';
            throw new Error(errMsg);
        }

        const created = await res.json();
        return NextResponse.json({ success: true, data: created.data });
    } catch (error: any) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
    }
}
