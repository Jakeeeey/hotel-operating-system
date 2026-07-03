import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

// Helper to calculate days between dates
function getDaysBetween(startStr: string, endStr: string) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    // Setting hours to 0 to compare just the dates
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function POST(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const body = await request.json();
        const { reservation_id, new_room_id, new_check_in, new_check_out, override_amount } = body;

        if (!reservation_id || !new_room_id || !new_check_out) {
            return NextResponse.json({ error: 'reservation_id, new_room_id, and new_check_out are required.' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // 1. Fetch current reservation, items, and room info
        const resRes = await fetch(`${API_BASE_URL}/items/reservations_hos/${reservation_id}?fields=*`, { headers });
        if (!resRes.ok) throw new Error("Failed to fetch reservation");
        const resData = await resRes.json();
        const reservation = resData.data;

        // Fetch reservation items
        const itemsRes = await fetch(`${API_BASE_URL}/items/reservation_items_hos?filter={"reservation_id":{"_eq":${reservation_id}}}`, { headers });
        const itemsData = await itemsRes.json();
        const resItems = itemsData.data || [];
        if (resItems.length === 0) throw new Error("No reservation items found");
        const currentItem = resItems[0];
        const old_room_id = typeof currentItem.room_id === 'object' ? currentItem.room_id.id : currentItem.room_id;

        // 2. If room changed, fetch prices
        let priceDiffPerNight = 0;
        let isUpgrade = false;
        let isDowngrade = false;

        if (old_room_id !== new_room_id) {
            const oldRoomRes = await fetch(`${API_BASE_URL}/items/rooms_hos/${old_room_id}?fields=id,type_id`, { headers });
            const newRoomRes = await fetch(`${API_BASE_URL}/items/rooms_hos/${new_room_id}?fields=id,type_id`, { headers });
            
            const oldRoomData = await oldRoomRes.json();
            const newRoomData = await newRoomRes.json();

            const oldTypeRes = await fetch(`${API_BASE_URL}/items/room_types_hos/${oldRoomData.data.type_id}?fields=price`, { headers });
            const newTypeRes = await fetch(`${API_BASE_URL}/items/room_types_hos/${newRoomData.data.type_id}?fields=price`, { headers });

            const oldTypeData = await oldTypeRes.json();
            const newTypeData = await newTypeRes.json();

            const oldPrice = parseFloat(oldTypeData.data.price) || 0;
            const newPrice = parseFloat(newTypeData.data.price) || 0;

            priceDiffPerNight = newPrice - oldPrice;
            if (priceDiffPerNight > 0) isUpgrade = true;
            if (priceDiffPerNight < 0) isDowngrade = true;
        }

        // 3. Calculate date differences
        const originalCheckOut = reservation.check_out;
        const currentCheckIn = new_check_in || reservation.check_in;
        
        let calculatedAdjustment = 0;
        let chargeDesc = "";
        let chargeType = "Stay Adjustment";

        const originalDays = getDaysBetween(currentCheckIn, originalCheckOut);
        const newDays = getDaysBetween(currentCheckIn, new_check_out);

        // If dates changed but room is same
        if (old_room_id === new_room_id) {
            if (newDays !== originalDays) {
                // Fetch current room price
                const roomRes = await fetch(`${API_BASE_URL}/items/rooms_hos/${old_room_id}?fields=id,type_id`, { headers });
                const roomData = await roomRes.json();
                const typeRes = await fetch(`${API_BASE_URL}/items/room_types_hos/${roomData.data.type_id}?fields=price`, { headers });
                const typeData = await typeRes.json();
                const price = parseFloat(typeData.data.price) || 0;

                calculatedAdjustment = (newDays - originalDays) * price;
                chargeDesc = newDays > originalDays ? "Stay Extension" : "Stay Shortened";
                chargeType = newDays > originalDays ? "Stay Extension" : "Refund / Credit";
            }
        } else {
            // Room changed (upgrade/downgrade)
            // Assuming the change applies to all nights
            calculatedAdjustment = newDays * priceDiffPerNight;
            // Add/subtract the difference in total days at the new rate
            if (newDays !== originalDays) {
                const newRoomRes = await fetch(`${API_BASE_URL}/items/rooms_hos/${new_room_id}?fields=id,type_id`, { headers });
                const newRoomData = await newRoomRes.json();
                const newTypeRes = await fetch(`${API_BASE_URL}/items/room_types_hos/${newRoomData.data.type_id}?fields=price`, { headers });
                const newTypeData = await newTypeRes.json();
                const newPrice = parseFloat(newTypeData.data.price) || 0;
                
                calculatedAdjustment += (newDays - originalDays) * newPrice;
            }
            
            if (calculatedAdjustment > 0) {
                chargeDesc = "Room Upgrade / Extension";
                chargeType = "Room Upgrade";
            } else if (calculatedAdjustment < 0) {
                chargeDesc = "Room Downgrade / Shortened";
                chargeType = "Refund / Credit";
            }
        }

        // Apply manual override if provided
        const finalAdjustment = override_amount !== undefined && override_amount !== null 
            ? parseFloat(override_amount) 
            : calculatedAdjustment;

        // 4. Execute updates
        
        // Update reservation
        await fetch(`${API_BASE_URL}/items/reservations_hos/${reservation_id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                check_out: new_check_out,
                ...(new_check_in ? { check_in: new_check_in } : {})
            })
        });

        // Update room_id in reservation items
        if (old_room_id !== new_room_id) {
            await fetch(`${API_BASE_URL}/items/reservation_items_hos/${currentItem.id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    room_id: new_room_id
                })
            });
        }

        // 5. Create Folio Charge if adjustment != 0
        if (finalAdjustment !== 0) {
            const chargePayload = {
                reservation_id: reservation_id,
                charge_type: chargeType,
                description: chargeDesc,
                amount: finalAdjustment,
                charge_date: new Date().toISOString()
            };
            
            await fetch(`${API_BASE_URL}/items/guest_charges_hos`, {
                method: 'POST',
                headers,
                body: JSON.stringify(chargePayload)
            });
        }

        return NextResponse.json({ success: true, adjustment: finalAdjustment });

    } catch (error) {
        console.error('Error updating stay:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
