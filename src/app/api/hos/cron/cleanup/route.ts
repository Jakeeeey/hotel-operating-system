import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    // Simple protection: requiring the static token to trigger this cron
    if (authHeader !== `Bearer ${process.env.DIRECTUS_STATIC_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized cleanup request.' }, { status: 401 });
    }

    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'Missing API configuration.' }, { status: 500 });
    }

    const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(staticToken ? { Authorization: `Bearer ${staticToken}` } : {}),
    };

    const d = new Date(Date.now() - 15 * 60 * 1000);
    const manilaDate = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    const fifteenMinsAgo = manilaDate.toISOString().replace('Z', '');

    // 1. Find all pending reservations older than 15 minutes
    const filter = {
      _and: [
        { status: { _eq: 'pending' } },
        { created_at: { _lt: fifteenMinsAgo } }
      ]
    };

    const fetchRes = await fetch(
      `${API_BASE_URL}/items/reservations_hos?filter=${encodeURIComponent(JSON.stringify(filter))}&fields=id`,
      { headers }
    );

    if (!fetchRes.ok) {
      const err = await fetchRes.text();
      throw new Error(`Failed to fetch stale reservations: ${err}`);
    }

    const fetchJson = await fetchRes.json();
    const staleReservations = fetchJson.data || [];

    if (staleReservations.length === 0) {
      return NextResponse.json({ message: 'No stale pending reservations found.' });
    }

    const idsToDelete = staleReservations.map((res: { id: number | string }) => res.id);

    // 2. Delete them (Directus will cascade delete the reservation_items_hos if foreign keys are setup correctly)
    // If cascade delete is not on, we should delete the items first, but usually reservations manage their items.
    // To be safe, we can just update status to "cancelled" instead of hard deleting.
    const updatePayload = {
      keys: idsToDelete,
      data: { status: 'cancelled' }
    };

    const updateRes = await fetch(`${API_BASE_URL}/items/reservations_hos`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updatePayload),
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Failed to cancel stale reservations: ${err}`);
    }

    return NextResponse.json({
      message: `Successfully cancelled ${idsToDelete.length} stale pending reservation(s).`,
      cancelledIds: idsToDelete
    });

  } catch (error: unknown) {
    console.error('CRON Cleanup Failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
