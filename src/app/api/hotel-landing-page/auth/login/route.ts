import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

    if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
      return NextResponse.json({ error: "Directus configuration is missing" }, { status: 500 });
    }

    const authHeaders = { 
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json"
    };

    // Query guest_accounts_hos for the email and plain text password (for now)
    const accountRes = await fetch(
      `${DIRECTUS_URL}/items/guest_accounts_hos?filter[email][_eq]=${encodeURIComponent(email)}&filter[password][_eq]=${encodeURIComponent(password)}&fields=id,email`,
      {
        headers: authHeaders,
      }
    );

    if (!accountRes.ok) {
      console.error("[LOGIN] Error querying account");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const accountData = await accountRes.json();
    
    if (!accountData.data || accountData.data.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const account = accountData.data[0];
    const accountId = account.id;

    // Fetch the linked profile from guests_hos
    const profileRes = await fetch(
      `${DIRECTUS_URL}/items/guests_hos?filter[account_id][_eq]=${accountId}&fields=id,first_name,last_name`,
      {
        headers: authHeaders,
      }
    );

    const profileData = await profileRes.json();
    const profile = profileData.data?.[0];
    const guestId = profile?.id;

    // Set Session Cookie
    const response = NextResponse.json({ success: true, accountId, guestId }, { status: 200 });
    
    const sessionData = JSON.stringify({ 
      accountId, 
      guestId, 
      email: account.email, 
      first_name: profile?.first_name, 
      last_name: profile?.last_name 
    });

    response.cookies.set("guest_session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;

  } catch (error) {
    console.error("[LOGIN] Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
