import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, first_name, last_name, contact_number, id_number, id_photo_uuid } = body;

    const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

    if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
      return NextResponse.json({ error: "Directus configuration is missing" }, { status: 500 });
    }

    const authHeaders = { 
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json"
    };

    // 1. Create the account in guest_accounts_hos
    const accountPayload = {
      email,
      password, // Stored in plain text for now, as requested
      is_email_verified: 0,
      id_number,
      id_photo_uuid
    };

    const accountRes = await fetch(`${DIRECTUS_URL}/items/guest_accounts_hos`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(accountPayload),
    });

    if (!accountRes.ok) {
      const errorData = await accountRes.json();
      console.error("[REGISTER] Error creating account:", errorData);
      return NextResponse.json({ error: "Failed to create account. Email might already exist." }, { status: 400 });
    }

    const accountData = await accountRes.json();
    const accountId = accountData.data.id;

    // 2. Create the profile in guests_hos
    const profilePayload = {
      account_id: accountId,
      first_name,
      last_name,
      email,
      contact_number
    };

    let profileRes;
    try {
      profileRes = await fetch(`${DIRECTUS_URL}/items/guests_hos`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(profilePayload),
      });

      if (!profileRes.ok) {
        throw new Error("Failed to create guest profile");
      }
    } catch (err) {
      // Rollback: Delete the account that was just created
      console.error("[REGISTER] Error creating profile, rolling back account:", err);
      await fetch(`${DIRECTUS_URL}/items/guest_accounts_hos/${accountId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      return NextResponse.json({ error: "Failed to create guest profile. Please try again." }, { status: 400 });
    }

    const profileData = await profileRes.json();
    const guestId = profileData.data.id;

    // 3. Set Session Cookie
    const response = NextResponse.json({ success: true, accountId, guestId }, { status: 201 });
    
    // Simple session cookie storing accountId and guestId (in a real app, this should be signed/encrypted)
    const sessionData = JSON.stringify({ accountId, guestId, email, first_name, last_name });
    response.cookies.set("guest_session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;

  } catch (error) {
    console.error("[REGISTER] Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
