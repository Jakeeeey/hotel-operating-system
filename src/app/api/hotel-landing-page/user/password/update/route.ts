import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("guest_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const { accountId } = sessionData;

    const body = await req.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return NextResponse.json({ error: "Missing password fields" }, { status: 400 });
    }

    const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

    if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
      return NextResponse.json({ error: "Directus configuration is missing" }, { status: 500 });
    }

    const authHeaders = { 
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json"
    };

    // 1. Verify current password
    const verifyRes = await fetch(`${DIRECTUS_URL}/items/guest_accounts_hos/${accountId}?fields=password`, {
      method: "GET",
      headers: authHeaders,
    });

    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Failed to verify account" }, { status: 500 });
    }

    const verifyData = await verifyRes.json();
    if (verifyData.data.password !== current_password) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    // 2. Update to new password
    const updateRes = await fetch(`${DIRECTUS_URL}/items/guest_accounts_hos/${accountId}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ password: new_password }),
    });

    if (!updateRes.ok) {
      const errorData = await updateRes.json();
      console.error("[PASSWORD_UPDATE] Error updating password:", errorData);
      return NextResponse.json({ error: "Failed to update password." }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("[PASSWORD_UPDATE] Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
