import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload, COOKIE_NAME } from '@/lib/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

const getManilaDateString = (d: Date = new Date()) => {
    const manilaDate = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    return manilaDate.toISOString().replace('Z', '').split('T')[0];
};

// GET: Check availability of current room and fetch alternative rooms if there's a conflict
export async function GET(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const reservationId = searchParams.get('reservationId');
        const newCheckOutDate = searchParams.get('newCheckOutDate');

        if (!reservationId || !newCheckOutDate) {
            return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // 1. Fetch current reservation details
        const resQuery = await fetch(
            `${API_BASE_URL}/items/reservations/${reservationId}?fields=id,check_out_date,status`,
            { headers }
        );
        if (!resQuery.ok) {
            return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
        }
        const reservation = (await resQuery.json()).data;

        // Fetch corresponding reservation item to get room and type info
        const itemQuery = await fetch(
            `${API_BASE_URL}/items/reservation_items?filter=${encodeURIComponent(
                JSON.stringify({ reservation_id: { _eq: parseInt(reservationId, 10) } })
            )}&fields=room_id.id,room_id.room_number,room_type_id.id,room_type_id.type_name,locked_price&limit=1`,
            { headers }
        );
        if (!itemQuery.ok) {
            return NextResponse.json({ error: 'Reservation items not found.' }, { status: 404 });
        }
        const itemsData = await itemQuery.json();
        const firstItem = itemsData.data?.[0];

        if (!firstItem) {
            return NextResponse.json({ error: 'No items linked to reservation.' }, { status: 404 });
        }

        const currentRoomId = firstItem.room_id?.id || null;
        const roomTypeName = firstItem.room_type_id?.type_name || 'N/A';
        const roomTypeId = firstItem.room_type_id?.id;
        const lockedPrice = parseFloat(firstItem.locked_price) || 0;

        // 2. Generate extension night dates
        const originalCheckOut = new Date(reservation.check_out_date);
        const extendedCheckOut = new Date(newCheckOutDate);

        if (extendedCheckOut <= originalCheckOut) {
            return NextResponse.json({ error: 'New checkout date must be after current checkout date.' }, { status: 400 });
        }

        const extensionNights: string[] = [];
        const current = new Date(originalCheckOut);
        while (current < extendedCheckOut) {
            extensionNights.push(getManilaDateString(current));
            current.setDate(current.getDate() + 1);
        }

        if (extensionNights.length === 0) {
            return NextResponse.json({ error: 'No extension nights computed.' }, { status: 400 });
        }

        // 3. Check if current room has any conflicts on these extension nights
        let currentRoomConflict = false;
        if (currentRoomId) {
            const conflictQuery = await fetch(
                `${API_BASE_URL}/items/reservation_items?filter=${encodeURIComponent(
                    JSON.stringify({
                        room_id: { _eq: currentRoomId },
                        night_date: { _in: extensionNights },
                        reservation_id: { _neq: parseInt(reservationId, 10) }
                    })
                )}&limit=1`,
                { headers }
            );
            if (conflictQuery.ok) {
                const conflicts = await conflictQuery.json();
                if (conflicts.data && conflicts.data.length > 0) {
                    currentRoomConflict = true;
                }
            }
        } else {
            // Unassigned booking doesn't conflict with a specific room, but we still check room types or let it proceed
            currentRoomConflict = false;
        }

        // 4. Fetch alternative vacant rooms of the same room type for these dates
        let alternativeRooms: { id: number; room_number: string }[] = [];
        if (currentRoomConflict && roomTypeId) {
            // Get all operational/clean rooms of this type
            const roomsQuery = await fetch(
                `${API_BASE_URL}/items/rooms?filter=${encodeURIComponent(
                    JSON.stringify({
                        room_type_id: { _eq: roomTypeId },
                        operational_status_id: { _eq: 1 }, // Operational/Active
                    })
                )}&fields=id,room_number&limit=-1`,
                { headers }
            );

            if (roomsQuery.ok) {
                const allRooms = (await roomsQuery.json()).data || [];
                
                // Get all blocked room IDs for these dates
                const blockedItemsQuery = await fetch(
                    `${API_BASE_URL}/items/reservation_items?filter=${encodeURIComponent(
                        JSON.stringify({
                            room_type_id: { _eq: roomTypeId },
                            night_date: { _in: extensionNights },
                            room_id: { _null: false }
                        })
                    )}&fields=room_id&limit=-1`,
                    { headers }
                );

                const blockedRoomIds = new Set<number>();
                if (blockedItemsQuery.ok) {
                    const blockedItems = (await blockedItemsQuery.json()).data || [];
                    for (const bi of blockedItems) {
                        if (bi.room_id) {
                            blockedRoomIds.add(typeof bi.room_id === 'object' ? bi.room_id.id : bi.room_id);
                        }
                    }
                }

                // Filter out room ID that are blocked
                alternativeRooms = allRooms.filter((r: { id: number }) => !blockedRoomIds.has(r.id));
            }
        }

        return NextResponse.json({
            data: {
                reservationId: parseInt(reservationId, 10),
                guestName: reservation.guest_id ? `${reservation.guest_id.first_name} ${reservation.guest_id.last_name}` : 'Guest',
                currentRoomNumber: firstItem.room_id?.room_number || 'Unassigned',
                currentRoomId,
                roomTypeName,
                roomTypeId,
                lockedPrice,
                nightsToAdd: extensionNights.length,
                totalExtensionCost: lockedPrice * extensionNights.length,
                currentRoomConflict,
                alternativeRooms,
            }
        });

    } catch (error) {
        console.error('Error checking stay extension:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Execute the stay extension and update Directus records
export async function POST(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        let userId = null;
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload && payload.sub) userId = parseInt(payload.sub, 10);
        }

        const body = await request.json();
        const { reservationId, newCheckOutDate, newRoomId } = body;

        if (!reservationId || !newCheckOutDate) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // 1. Fetch current reservation details
        const resQuery = await fetch(
            `${API_BASE_URL}/items/reservations/${reservationId}?fields=id,check_out_date,total_amount,status`,
            { headers }
        );
        if (!resQuery.ok) {
            return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
        }
        const reservation = (await resQuery.json()).data;

        // Fetch corresponding reservation item to get room type and locked price
        const itemQuery = await fetch(
            `${API_BASE_URL}/items/reservation_items?filter=${encodeURIComponent(
                JSON.stringify({ reservation_id: { _eq: parseInt(reservationId, 10) } })
            )}&fields=room_id.id,room_type_id.id,locked_price&limit=1`,
            { headers }
        );
        if (!itemQuery.ok) {
            return NextResponse.json({ error: 'Reservation items not found.' }, { status: 404 });
        }
        const itemsData = await itemQuery.json();
        const firstItem = itemsData.data?.[0];

        if (!firstItem) {
            return NextResponse.json({ error: 'No items linked to reservation.' }, { status: 404 });
        }

        const currentRoomId = firstItem.room_id?.id || null;
        const roomTypeId = firstItem.room_type_id?.id;
        const lockedPrice = parseFloat(firstItem.locked_price) || 0;

        // 2. Generate extension night dates
        const originalCheckOut = new Date(reservation.check_out_date);
        const extendedCheckOut = new Date(newCheckOutDate);

        if (extendedCheckOut <= originalCheckOut) {
            return NextResponse.json({ error: 'New checkout date must be after current checkout date.' }, { status: 400 });
        }

        const extensionNights: string[] = [];
        const current = new Date(originalCheckOut);
        while (current < extendedCheckOut) {
            extensionNights.push(getManilaDateString(current));
            current.setDate(current.getDate() + 1);
        }

        if (extensionNights.length === 0) {
            return NextResponse.json({ error: 'No extension nights computed.' }, { status: 400 });
        }

        // Target room ID for the extension nights (allows Room Moves)
        const targetRoomId = newRoomId !== undefined ? newRoomId : currentRoomId;

        // 3. Double-check conflict for the selected room
        if (targetRoomId) {
            const conflictQuery = await fetch(
                `${API_BASE_URL}/items/reservation_items?filter=${encodeURIComponent(
                    JSON.stringify({
                        room_id: { _eq: targetRoomId },
                        night_date: { _in: extensionNights },
                        reservation_id: { _neq: parseInt(reservationId, 10) }
                    })
                )}&limit=1`,
                { headers }
            );
            if (conflictQuery.ok) {
                const conflicts = await conflictQuery.json();
                if (conflicts.data && conflicts.data.length > 0) {
                    return NextResponse.json({ error: 'The selected room is occupied or booked during these dates.' }, { status: 409 });
                }
            }
        }

        // 4. Update the reservation header (New check_out_date and updated total amount)
        const additionCost = lockedPrice * extensionNights.length;
        const newTotalAmount = (parseFloat(reservation.total_amount) || 0) + additionCost;

        const updateRes = await fetch(`${API_BASE_URL}/items/reservations/${reservationId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                check_out_date: newCheckOutDate,
                total_amount: newTotalAmount,
                updated_by: userId,
            }),
        });

        if (!updateRes.ok) {
            throw new Error('Failed to update reservation header.');
        }

        // 5. Create new night-by-night reservation items
        const itemPayloads = extensionNights.map((nightDate) => ({
            reservation_id: parseInt(reservationId, 10),
            room_type_id: roomTypeId,
            room_id: targetRoomId,
            night_date: nightDate,
            locked_price: lockedPrice,
            created_by: userId,
            updated_by: userId,
        }));

        const itemsCreate = await fetch(`${API_BASE_URL}/items/reservation_items`, {
            method: 'POST',
            headers,
            body: JSON.stringify(itemPayloads),
        });

        if (!itemsCreate.ok) {
            throw new Error('Failed to insert new night-by-night reservation items.');
        }

        return NextResponse.json({
            success: true,
            data: {
                reservationId: parseInt(reservationId, 10),
                newCheckOutDate,
                nightsAdded: extensionNights.length,
                additionCost,
                newTotalAmount,
            }
        });

    } catch (error: unknown) {
        console.error('Error executing stay extension:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
