import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractClientIp } from "@/lib/rate-limiter";

export const SESSION_COOKIE_NAME = "liz_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate a cryptographically secure random session token.
 * 32 bytes of CSPRNG entropy encoded as 64-character hexadecimal string.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash session token with SHA-256 for secure database storage.
 * The plaintext token resides only in the client's HttpOnly cookie.
 */
export function hashSessionToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Create a new session row in PostgreSQL and return the raw plaintext token.
 */
export async function createSession(userId: string, request: Request) {
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const clientIp = extractClientIp(request);
  const userAgent = request.headers.get("user-agent") || "Unknown Client";
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const session = await prisma.session.create({
    data: {
      userId,
      token: tokenHash,
      ipAddress: clientIp,
      userAgent,
      expiresAt,
    },
  });

  return { session, rawToken };
}

/**
 * Validate incoming raw session token from cookie.
 * Hashes candidate token, retrieves active session, and checks expiration.
 */
export async function validateSession(rawToken: string) {
  if (!rawToken || typeof rawToken !== "string") {
    return null;
  }

  const tokenHash = hashSessionToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { token: tokenHash },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          organizationType: true,
          isVerified: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check expiration
  if (new Date() > session.expiresAt) {
    // Delete expired session asynchronously
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return { session, user: session.user };
}

/**
 * Revoke single active session by raw token.
 */
export async function revokeSession(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;
  const tokenHash = hashSessionToken(rawToken);
  try {
    await prisma.session.delete({ where: { token: tokenHash } });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Revoke all active sessions for a given user (e.g. on password reset or account deletion).
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { userId },
  });
  return result.count;
}

/**
 * Attach the secure session cookie to an HTTP response.
 * Cookie Flags:
 * - httpOnly: true (blocks client-side JavaScript document.cookie access)
 * - secure: true in production (forces HTTPS transport)
 * - sameSite: "lax" (mitigates CSRF on cross-site requests)
 * - path: "/" (scoped to entire origin)
 * - maxAge: 7 days
 */
export function setSessionCookie(response: NextResponse, rawToken: string) {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: rawToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });
}

/**
 * Clear the session cookie on logout.
 */
export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

