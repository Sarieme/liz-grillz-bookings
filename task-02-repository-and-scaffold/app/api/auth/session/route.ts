import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, ...v] = c.split("=");
        return [k, v.join("=")];
      })
    );
    const rawToken = cookies[SESSION_COOKIE_NAME];

    if (!rawToken) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const sessionData = await validateSession(rawToken);

    if (!sessionData) {
      return NextResponse.json(
        { authenticated: false, error: "Session invalid or expired." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: sessionData.user,
        session: {
          id: sessionData.session.id,
          expiresAt: sessionData.session.expiresAt.toISOString(),
          ipAddress: sessionData.session.ipAddress,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[SESSION CHECK ERROR]", error);
    return NextResponse.json(
      { error: "Failed to validate session." },
      { status: 500 }
    );
  }
}

