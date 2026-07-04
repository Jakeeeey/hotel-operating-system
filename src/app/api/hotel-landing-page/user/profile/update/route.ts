import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("guest_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const { accountId, guestId } = sessionData;

    const body = await req.json();
    const { email, id_number, id_photo_uuid } = body;

    const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

    if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
      return NextResponse.json({ error: "Directus configuration is missing" }, { status: 500 });
    }

    const authHeaders = { 
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json"
    };

    // 1. Update guest_accounts_hos
    const accountPayload: any = {};
    if (email) accountPayload.email = email;
    if (id_number) accountPayload.id_number = id_number;
    if (id_photo_uuid) accountPayload.id_photo_uuid = id_photo_uuid;

    if (Object.keys(accountPayload).length > 0) {
      const accountRes = await fetch(`${DIRECTUS_URL}/items/guest_accounts_hos/${accountId}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify(accountPayload),
      });

      if (!accountRes.ok) {
        const errorData = await accountRes.json();
        console.error("[PROFILE_UPDATE] Error updating account:", errorData);
        return NextResponse.json({ error: "Failed to update account details." }, { status: 400 });
      }
    }

    // 2. Update guests_hos
    const profilePayload: any = {};
    if (email) profilePayload.email = email;

    if (Object.keys(profilePayload).length > 0) {
      const profileRes = await fetch(`${DIRECTUS_URL}/items/guests_hos/${guestId}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify(profilePayload),
      });

      if (!profileRes.ok) {
        const errorData = await profileRes.json();
        console.error("[PROFILE_UPDATE] Error updating profile:", errorData);
        return NextResponse.json({ error: "Failed to update profile details." }, { status: 400 });
      }
    }

    // Update session cookie if email changed
    const response = NextResponse.json({ success: true }, { status: 200 });
    if (email) {
      const newSessionData = { ...sessionData, email };
      response.cookies.set("guest_session", JSON.stringify(newSessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
    }

    return response;

  } catch (error) {
    console.error("[PROFILE_UPDATE] Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
