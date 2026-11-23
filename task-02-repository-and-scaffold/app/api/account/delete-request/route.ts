import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, validateSession, revokeAllUserSessions, clearSessionCookie } from "@/lib/session";

export const GRACE_PERIOD_DAYS = 7;
export const GRACE_PERIOD_MS = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
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
      return NextResponse.json(
        { error: "Authentication required to request account deletion." },
        { status: 401 }
      );
    }

    const sessionData = await validateSession(rawToken);
    if (!sessionData) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please sign in." },
        { status: 401 }
      );
    }

    const userId = sessionData.user.id;
    const now = new Date();
    const scheduledHardDeleteAt = new Date(now.getTime() + GRACE_PERIOD_MS);

    // Stage 1 & 2: Lock account, schedule hard deletion, and record deletion timestamp
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "LOCKED_DELETION_PENDING",
        deletionRequestedAt: now,
        scheduledHardDeleteAt,
      },
    });

    // Stage 1: Immediate Session Revocation across ALL devices
    const revokedSessionsCount = await revokeAllUserSessions(userId);
    console.log(
      `[NDPA DELETION REQUEST] User ${userId} (${updatedUser.email}) locked. Revoked ${revokedSessionsCount} active sessions. Scheduled purge: ${scheduledHardDeleteAt.toISOString()}`
    );

    const response = NextResponse.json(
      {
        message: `Account scheduled for deletion under NDPA rules. Your 7-day grace period expires on ${scheduledHardDeleteAt.toLocaleDateString()}. All active sessions have been revoked.`,
        deletionStatus: {
          userId: updatedUser.id,
          status: updatedUser.status,
          deletionRequestedAt: updatedUser.deletionRequestedAt?.toISOString(),
          scheduledHardDeleteAt: updatedUser.scheduledHardDeleteAt?.toISOString(),
          gracePeriodDays: GRACE_PERIOD_DAYS,
          revokedSessionsCount,
        },
      },
      { status: 200 }
    );

    // Clear local browser cookie
    clearSessionCookie(response);

    return response;
  } catch (error: any) {
    console.error("[ACCOUNT DELETION REQUEST ERROR]", error);
    return NextResponse.json(
      { error: "Failed to process deletion request." },
      { status: 500 }
    );
  }
}

