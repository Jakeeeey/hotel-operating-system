import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("guest_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);

    return NextResponse.json(
      {
        user: {
          accountId: sessionData.accountId,
          guestId: sessionData.guestId,
          email: sessionData.email,
          first_name: sessionData.first_name,
          last_name: sessionData.last_name,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AUTH_ME] Error reading session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
