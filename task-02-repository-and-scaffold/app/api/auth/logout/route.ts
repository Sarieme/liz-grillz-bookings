import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, revokeSession, clearSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    // Read session cookie from request headers
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, ...v] = c.split("=");
        return [k, v.join("=")];
      })
    );
    const rawToken = cookies[SESSION_COOKIE_NAME];

    if (rawToken) {
      await revokeSession(rawToken);
      console.log(`[AUTH LOGOUT] Session revoked from database`);
    }

    const response = NextResponse.json(
      { message: "Signed out successfully. Session revoked." },
      { status: 200 }
    );

    // Clear cookie
    clearSessionCookie(response);

    return response;
  } catch (error: any) {
    console.error("[LOGOUT ERROR]", error);
    const response = NextResponse.json(
      { error: "Logout failed due to a server error." },
      { status: 500 }
    );
    clearSessionCookie(response);
    return response;
  }
}

