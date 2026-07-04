import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("guest_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const { guestId } = sessionData;

    const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

    if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
      return NextResponse.json({ error: "Directus configuration is missing" }, { status: 500 });
    }

    const authHeaders = { 
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json"
    };

    // Fetch reservations for the guest
    const res = await fetch(`${DIRECTUS_URL}/items/reservations_hos?filter[guest_id][_eq]=${guestId}&fields=id,check_in,check_out,total_amount,status`, {
      method: "GET",
      headers: authHeaders,
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("[RESERVATIONS] Error fetching reservations:", errorData);
      return NextResponse.json({ error: "Failed to fetch reservations." }, { status: 400 });
    }

    const data = await res.json();
    const reservations = data.data;

    // For each reservation, fetch its items to aggregate adult and children counts
    const populatedReservations = await Promise.all(reservations.map(async (reservation: any) => {
      const itemsRes = await fetch(`${DIRECTUS_URL}/items/reservation_items_hos?filter[reservation_id][_eq]=${reservation.id}&fields=adults_count,children_count`, {
        method: "GET",
        headers: authHeaders,
      });

      let adults_count = 0;
      let children_count = 0;

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        const items = itemsData.data || [];
        for (const item of items) {
          adults_count += item.adults_count;
          children_count += item.children_count;
        }
      }

      return {
        ...reservation,
        adults_count,
        children_count
      };
    }));

    return NextResponse.json({ success: true, reservations: populatedReservations }, { status: 200 });

  } catch (error) {
    console.error("[RESERVATIONS] Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
