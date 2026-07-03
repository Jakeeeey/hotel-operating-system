import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function GET(request: Request) {
    try {
        if (!API_BASE_URL) {
            return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const startDateStr = searchParams.get("startDate");
        const endDateStr = searchParams.get("endDate");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "15", 10);

        const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(staticToken ? { 'Authorization': `Bearer ${staticToken}` } : {}),
        };

        // Date filter
        let filterObj = {};
        if (startDateStr && endDateStr) {
            filterObj = {
                _between: [startDateStr, endDateStr]
            };
        } else if (startDateStr) {
            filterObj = { _gte: startDateStr };
        } else if (endDateStr) {
            filterObj = { _lte: endDateStr };
        }

        const payFilter = encodeURIComponent(JSON.stringify(
            Object.keys(filterObj).length > 0 ? { payment_date: filterObj } : {}
        ));
        const chargeFilter = encodeURIComponent(JSON.stringify(
            Object.keys(filterObj).length > 0 ? { charge_date: filterObj } : {}
        ));

        // Fetch payments
        const payRes = await fetch(
            `${API_BASE_URL}/items/payments_hos?filter=${payFilter}&limit=-1&fields=id,reservation_id,amount,payment_method,payment_date,status,created_at`,
            { headers }
        );
        let payments = [];
        if (payRes.ok) {
            const payData = await payRes.json();
            payments = payData.data || [];
        }

        // Fetch guest charges
        const chargeRes = await fetch(
            `${API_BASE_URL}/items/guest_charges_hos?filter=${chargeFilter}&limit=-1&fields=id,reservation_id,charge_type,amount,charge_date,created_at`,
            { headers }
        );
        let charges = [];
        if (chargeRes.ok) {
            const chargeData = await chargeRes.json();
            charges = chargeData.data || [];
        }

        // Fetch reservations and guests
        const reservationIds = new Set<number>();
        payments.forEach((p: any) => p.reservation_id && reservationIds.add(p.reservation_id));
        charges.forEach((c: any) => c.reservation_id && reservationIds.add(c.reservation_id));

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

        // Standardize and merge records
        const allTransactions = [];
        let totalRevenue = 0;
        let uniqueGuests = new Set<string>();

        payments.forEach((p: any) => {
            const resData = resMap.get(p.reservation_id);
            const guestName = resData?.guestName || 'Unknown';
            uniqueGuests.add(guestName);

            const amt = parseFloat(p.amount) || 0;
            const status = (p.status || '').toLowerCase();
            if (status === 'settled' || status === 'completed') {
                totalRevenue += amt;
            }

            allTransactions.push({
                id: `payment_${p.id}`,
                guestName,
                transaction: resData?.isOnline ? 'Online' : 'Offline',
                type: 'Payment',
                method: p.payment_method || 'Unknown',
                amount: amt,
                status: p.status || 'Unknown',
                dateTime: p.payment_date || p.created_at,
            });
        });

        charges.forEach((c: any) => {
            const resData = resMap.get(c.reservation_id);
            const guestName = resData?.guestName || 'Unknown';
            uniqueGuests.add(guestName);

            const amt = parseFloat(c.amount) || 0;
            
            allTransactions.push({
                id: `charge_${c.id}`,
                guestName,
                transaction: resData?.isOnline ? 'Online' : 'Offline',
                type: c.charge_type || 'Charge',
                method: '-', // Charges usually don't have a payment method until paid
                amount: amt,
                status: 'Applied', // Default status for charges
                dateTime: c.charge_date || c.created_at,
            });
        });

        // Sort by dateTime descending
        allTransactions.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

        // Pagination
        const totalRecords = allTransactions.length;
        const totalPages = Math.ceil(totalRecords / limit) || 1;
        const startIndex = (page - 1) * limit;
        const paginatedData = allTransactions.slice(startIndex, startIndex + limit);

        return NextResponse.json({
            metrics: {
                guestsStayed: uniqueGuests.size,
                totalRevenue: totalRevenue,
            },
            transactions: {
                data: paginatedData,
                totalRecords,
                totalPages,
            }
        });

    } catch (error) {
        console.error('Error fetching financial ledger data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
