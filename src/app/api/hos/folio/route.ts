import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload, COOKIE_NAME } from '@/lib/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

/**
 * GET /api/hos/folio?reservationId=123
 * Fetches all charges (guest_charges_hos) and payments (payments_hos) for a reservation.
 */
export async function GET(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const reservationId = searchParams.get('reservationId');

        if (!reservationId) {
            return NextResponse.json({ error: 'reservationId is required.' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // Fetch reservation details for base info
        const resRes = await fetch(
            `${API_BASE_URL}/items/reservations_hos/${reservationId}?fields=id,guest_id,check_in,check_out,total_amount,status`,
            { headers }
        );

        let reservation = null;
        if (resRes.ok) {
            const resData = await resRes.json();
            const rawRes = resData.data || null;
            if (rawRes) {
                reservation = {
                    ...rawRes,
                    check_in_date: rawRes.check_in,
                    check_out_date: rawRes.check_out
                };
            }
        }

        // Fetch charges from guest_charges_hos
        const chargeFilter = encodeURIComponent(JSON.stringify({ reservation_id: { _eq: parseInt(reservationId, 10) } }));
        const chargesRes = await fetch(
            `${API_BASE_URL}/items/guest_charges_hos?filter=${chargeFilter}&sort=charge_date&fields=id,reservation_id,charge_type,description,amount,charge_date,created_at`,
            { headers }
        );

        let charges: unknown[] = [];
        if (chargesRes.ok) {
            const chargesData = await chargesRes.json();
            charges = chargesData.data || [];
        }

        // Fetch payments from payments_hos
        const paymentFilter = encodeURIComponent(JSON.stringify({ reservation_id: { _eq: parseInt(reservationId, 10) } }));
        const paymentsRes = await fetch(
            `${API_BASE_URL}/items/payments_hos?filter=${paymentFilter}&sort=payment_date&fields=id,reservation_id,amount,payment_method,payment_date,reference_number,status,notes,created_at`,
            { headers }
        );

        let payments: unknown[] = [];
        if (paymentsRes.ok) {
            const paymentsData = await paymentsRes.json();
            payments = paymentsData.data || [];
        }

        return NextResponse.json({
            success: true,
            data: {
                reservation,
                charges,
                payments,
            },
        });
    } catch (error) {
        console.error('Error fetching folio:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/hos/folio
 * Adds a charge or payment entry.
 * Body: { type: "charge" | "payment", reservationId, ...fields }
 */
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
        const { type, reservationId } = body;

        if (!type || !reservationId) {
            return NextResponse.json({ error: 'type and reservationId are required.' }, { status: 400 });
        }

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        if (type === 'charge') {
            const { charge_type, description, amount } = body;

            if (!charge_type || !description || amount == null) {
                return NextResponse.json({ error: 'charge_type, description, and amount are required.' }, { status: 400 });
            }

            const chargePayload = {
                reservation_id: reservationId,
                charge_type,
                description,
                amount: parseFloat(amount),
                charge_date: new Date().toISOString(),
                created_by: userId,
                updated_by: userId,
            };

            const createRes = await fetch(`${API_BASE_URL}/items/guest_charges_hos`, {
                method: 'POST',
                headers,
                body: JSON.stringify(chargePayload),
            });

            if (!createRes.ok) {
                const err = await createRes.json().catch(() => ({}));
                console.error('Failed to create charge:', err);
                return NextResponse.json({ error: 'Failed to add charge.', details: err }, { status: 500 });
            }

            const created = await createRes.json();
            return NextResponse.json({ success: true, data: created.data });
        }

        if (type === 'payment') {
            const { amount, payment_method, reference_number, notes } = body;

            if (amount == null || !payment_method) {
                return NextResponse.json({ error: 'amount and payment_method are required.' }, { status: 400 });
            }

            const paymentPayload = {
                reservation_id: reservationId,
                amount: parseFloat(amount),
                payment_method,
                reference_number: reference_number || null,
                status: 'Completed',
                notes: notes || null,
                payment_date: new Date().toISOString(),
                created_by: userId,
                updated_by: userId,
            };

            const createRes = await fetch(`${API_BASE_URL}/items/payments_hos`, {
                method: 'POST',
                headers,
                body: JSON.stringify(paymentPayload),
            });

            if (!createRes.ok) {
                const err = await createRes.json().catch(() => ({}));
                console.error('Failed to create payment:', err);
                return NextResponse.json({ error: 'Failed to add payment.', details: err }, { status: 500 });
            }

            const created = await createRes.json();
            return NextResponse.json({ success: true, data: created.data });
        }

        return NextResponse.json({ error: 'Invalid type. Must be "charge" or "payment".' }, { status: 400 });
    } catch (error) {
        console.error('Error creating folio entry:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
