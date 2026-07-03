import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload, COOKIE_NAME } from '@/lib/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

/**
 * GET /api/hos/shift-ledger
 *
 * Returns the active shift for the current user, along with aggregated
 * payment/charge data within the shift window.
 */
export async function GET() {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        let userId: number | null = null;
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload && payload.sub) userId = parseInt(payload.sub, 10);
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // 1. Find active (Open) shift
        const shiftFilter = encodeURIComponent(JSON.stringify({
            status: { _eq: 'Open' },
        }));
        const shiftRes = await fetch(
            `${API_BASE_URL}/items/shifts_hos?filter=${shiftFilter}&sort=-opened_at&limit=1&fields=id,user_id,opened_at,starting_cash,status`,
            { headers }
        );

        console.log('[Shift Ledger API GET] Fetch shifts_hos response status:', shiftRes.status);

        let activeShift = null;
        if (shiftRes.ok) {
            const shiftData = await shiftRes.json();
            console.log('[Shift Ledger API GET] Fetch shifts_hos response data:', JSON.stringify(shiftData));
            const shifts = shiftData.data || [];
            if (shifts.length > 0) {
                activeShift = shifts[0];
            }
        } else {
            const errBody = await shiftRes.text().catch(() => '');
            console.error('[Shift Ledger API GET] Fetch shifts_hos failed:', errBody);
        }

        // 2. Fetch recent closed shifts for history (last 10)
        const closedFilter = encodeURIComponent(JSON.stringify({
            status: { _eq: 'Closed' },
        }));
        const closedShiftsRes = await fetch(
            `${API_BASE_URL}/items/shifts_hos?filter=${closedFilter}&sort=-closed_at&limit=10&fields=id,user_id,opened_at,closed_at,starting_cash,expected_cash,actual_cash,variance,status,resolved_by,resolution_notes`,
            { headers }
        );
        let closedShifts: unknown[] = [];
        if (closedShiftsRes.ok) {
            const closedData = await closedShiftsRes.json();
            closedShifts = closedData.data || [];
        }

        // 3. Aggregate payments & charges within shift window
        let payments: unknown[] = [];
        let charges: unknown[] = [];
        let recognizedRevenue = 0;
        let liabilities = 0;
        let expectedCash = 0;
        let onlinePaymentsTotal = 0;

        if (activeShift) {
            const openedDate = new Date(activeShift.opened_at);
            
            // Get the calendar date in Manila time (YYYY-MM-DD)
            const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
            const manilaDateStr = formatter.format(openedDate); 
            
            // Create UTC bounds for that specific Manila day
            const startOfDayManila = new Date(`${manilaDateStr}T00:00:00+08:00`).toISOString();
            const endOfDayManila = new Date(`${manilaDateStr}T23:59:59.999+08:00`).toISOString();

            // Fetch all payments created during this specific day
            const payFilter = encodeURIComponent(JSON.stringify({
                payment_date: { _between: [startOfDayManila, endOfDayManila] },
            }));
            const payRes = await fetch(
                `${API_BASE_URL}/items/payments_hos?filter=${payFilter}&sort=-payment_date&limit=-1&fields=id,reservation_id,amount,payment_method,payment_date,reference_number,status,notes,created_at`,
                { headers }
            );
            if (payRes.ok) {
                const payData = await payRes.json();
                payments = payData.data || [];
            }

            // Fetch all guest charges during this specific day
            const chargeFilter = encodeURIComponent(JSON.stringify({
                charge_date: { _between: [startOfDayManila, endOfDayManila] },
            }));
            const chargeRes = await fetch(
                `${API_BASE_URL}/items/guest_charges_hos?filter=${chargeFilter}&sort=-charge_date&limit=-1&fields=id,reservation_id,charge_type,description,amount,charge_date,created_at`,
                { headers }
            );
            if (chargeRes.ok) {
                const chargeData = await chargeRes.json();
                charges = chargeData.data || [];
            }

            // Batch lookup reservations
            const reservationIds = new Set<number>();
            (payments as any[]).forEach(p => p.reservation_id && reservationIds.add(p.reservation_id));
            (charges as any[]).forEach(c => c.reservation_id && reservationIds.add(c.reservation_id));

            const resMap = new Map<number, { guestName: string; isOnline: boolean }>();
            if (reservationIds.size > 0) {
                const resFilter = encodeURIComponent(JSON.stringify({
                    id: { _in: Array.from(reservationIds) }
                }));
                const reservationsRes = await fetch(
                    `${API_BASE_URL}/items/reservations_hos?filter=${resFilter}&limit=-1&fields=id,booking_source,guest_id.first_name,guest_id.last_name`,
                    { headers }
                );
                if (reservationsRes.ok) {
                    const reservationsData = await reservationsRes.json();
                    const reservations = reservationsData.data || [];
                    reservations.forEach((res: any) => {
                        const firstName = res.guest_id?.first_name || '';
                        const lastName = res.guest_id?.last_name || '';
                        const guestName = `${firstName} ${lastName}`.trim();
                        const isOnline = res.booking_source && res.booking_source !== 'Walk-In';
                        resMap.set(res.id, { guestName, isOnline });
                    });
                }
            }

            // Enrich payments and charges
            payments = (payments as any[]).map(p => {
                const resData = resMap.get(p.reservation_id);
                return {
                    ...p,
                    guestName: resData?.guestName || '',
                    isOnline: !!resData?.isOnline,
                };
            });
            charges = (charges as any[]).map(c => {
                const resData = resMap.get(c.reservation_id);
                return {
                    ...c,
                    guestName: resData?.guestName || '',
                };
            });

            // Calculate aggregates
            const startingCash = parseFloat(activeShift.starting_cash) || 0;

            for (const p of payments as { amount: number; payment_method: string; status: string; notes?: string; isOnline: boolean }[]) {
                const amt = parseFloat(String(p.amount)) || 0;
                const method = (p.payment_method || '').toUpperCase();
                const status = (p.status || '').toLowerCase();

                // Recognized revenue = Settled or Completed payments
                if (status === 'settled' || status === 'completed') {
                    // Check if it's a liability hold (incidental deposit)
                    if (p.notes && p.notes.toLowerCase().includes('incidental deposit')) {
                        liabilities += amt;
                    } else {
                        recognizedRevenue += amt;
                        if (p.isOnline) {
                            onlinePaymentsTotal += amt;
                        }
                    }
                }

                // Liability Held status
                if (status === 'liability held') {
                    liabilities += amt;
                }

                // Refunded/Voided (subtract from recognized revenue)
                if (status === 'refunded' || status === 'voided') {
                    recognizedRevenue -= amt;
                    if (p.isOnline) {
                        onlinePaymentsTotal -= amt;
                    }
                    if (method === 'CASH') {
                        expectedCash -= amt;
                    }
                }

                // Cash drawer: only CASH payments
                if (method === 'CASH' && (status === 'settled' || status === 'completed' || status === 'liability held')) {
                    expectedCash += amt;
                }
            }

            expectedCash += startingCash;
        }

        return NextResponse.json({
            success: true,
            data: {
                activeShift,
                closedShifts,
                payments,
                charges,
                aggregates: {
                    recognizedRevenue: Math.round(recognizedRevenue * 100) / 100,
                    onlinePaymentsTotal: Math.round(onlinePaymentsTotal * 100) / 100,
                    liabilities: Math.round(liabilities * 100) / 100,
                    expectedCash: Math.round(expectedCash * 100) / 100,
                },
                userId,
            },
        });
    } catch (error) {
        console.error('Error fetching shift ledger:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/hos/shift-ledger
 *
 * Body: { action: "open" | "close", ... }
 * - open: { action: "open", starting_cash: number }
 * - close: { action: "close", shiftId: number, actual_cash: number, expected_cash: number, resolved_by?: string, resolution_notes?: string }
 */
export async function POST(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        let userId: number | null = null;
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload && payload.sub) userId = parseInt(payload.sub, 10);
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        const body = await request.json();
        const { action } = body;

        if (!action) {
            return NextResponse.json({ error: 'action is required (open or close).' }, { status: 400 });
        }

        // ---- OPEN SHIFT ----
        if (action === 'open') {
            const { starting_cash } = body;

            if (starting_cash == null || isNaN(parseFloat(starting_cash))) {
                return NextResponse.json({ error: 'starting_cash is required.' }, { status: 400 });
            }

            // Check for existing open shift
            const existingFilter = encodeURIComponent(JSON.stringify({ status: { _eq: 'Open' } }));
            const existingRes = await fetch(
                `${API_BASE_URL}/items/shifts_hos?filter=${existingFilter}&limit=1&fields=id`,
                { headers }
            );
            if (existingRes.ok) {
                const existingData = await existingRes.json();
                if ((existingData.data || []).length > 0) {
                    return NextResponse.json({ error: 'A shift is already open. Close it before opening a new one.' }, { status: 409 });
                }
            }

            const shiftPayload = {
                user_id: userId,
                opened_at: new Date().toISOString(),
                starting_cash: parseFloat(starting_cash),
                status: 'Open',
                created_by: userId,
                updated_by: userId,
            };

            const createRes = await fetch(`${API_BASE_URL}/items/shifts_hos`, {
                method: 'POST',
                headers,
                body: JSON.stringify(shiftPayload),
            });

            if (!createRes.ok) {
                const err = await createRes.json().catch(() => ({}));
                console.error('Failed to open shift:', err);
                return NextResponse.json({ error: 'Failed to open shift.', details: err }, { status: 500 });
            }

            const created = await createRes.json();
            return NextResponse.json({ success: true, data: created.data, message: 'Shift opened successfully.' });
        }

        // ---- CLOSE SHIFT ----
        if (action === 'close') {
            const { shiftId, actual_cash, expected_cash, resolved_by, resolution_notes } = body;

            if (!shiftId) {
                return NextResponse.json({ error: 'shiftId is required.' }, { status: 400 });
            }
            if (actual_cash == null) {
                return NextResponse.json({ error: 'actual_cash is required.' }, { status: 400 });
            }

            const actualCash = parseFloat(actual_cash);
            const expCash = parseFloat(expected_cash) || 0;
            const variance = Math.round((actualCash - expCash) * 100) / 100;

            const closePayload: Record<string, unknown> = {
                closed_at: new Date().toISOString(),
                expected_cash: expCash,
                actual_cash: actualCash,
                variance,
                status: 'Closed',
                updated_by: userId,
            };

            if (resolved_by) closePayload.resolved_by = resolved_by;
            if (resolution_notes) closePayload.resolution_notes = resolution_notes;

            const patchRes = await fetch(`${API_BASE_URL}/items/shifts_hos/${shiftId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(closePayload),
            });

            if (!patchRes.ok) {
                const err = await patchRes.json().catch(() => ({}));
                console.error('Failed to close shift:', err);
                return NextResponse.json({ error: 'Failed to close shift.', details: err }, { status: 500 });
            }

            const patched = await patchRes.json();
            return NextResponse.json({ success: true, data: patched.data, message: 'Shift closed successfully.' });
        }

        return NextResponse.json({ error: 'Invalid action. Must be "open" or "close".' }, { status: 400 });
    } catch (error) {
        console.error('Error in shift ledger operation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
