import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "liz_session";

// Define protected route patterns
const protectedRoutes = ["/dashboard", "/admin", "/account", "/bookings/manage"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    // If no session cookie exists, redirect to login
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL("/auth", request.url);
      loginUrl.searchParams.set("mode", "login");
      loginUrl.searchParams.set("redirect", pathname);
      console.log(`[MIDDLEWARE 307] Unauthenticated access to ${pathname} redirected to /auth`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/bookings/manage/:path*",
  ],
};

