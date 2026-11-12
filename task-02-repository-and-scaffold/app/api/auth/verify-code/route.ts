import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashVerificationCode } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const cleanCode = String(code || "").trim();

    if (!normalizedEmail || !cleanCode) {
      return NextResponse.json(
        { error: "Both email and verification code are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    // Retrieve most recent verification code
    const verification = await prisma.emailVerification.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "No verification code found for this account." },
        { status: 404 }
      );
    }

    // Check 1: Expiration check
    if (new Date() > verification.expiresAt) {
      console.log(`[VERIFY FAILED] Code expired for user ${user.id}`);
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check 2: Replay check (already used)
    if (verification.used) {
      console.log(`[VERIFY FAILED] Code already used for user ${user.id}`);
      return NextResponse.json(
        { error: "Verification code has already been used. Please sign in." },
        { status: 400 }
      );
    }

    // Check 3: Code hash match
    const hashedInput = hashVerificationCode(cleanCode);
    if (hashedInput !== verification.codeHash) {
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      console.log(`[VERIFY FAILED] Invalid code attempt for user ${user.id}`);
      return NextResponse.json(
        { error: "Invalid verification code. Please check the code and try again." },
        { status: 400 }
      );
    }

    // Mark verified
    await prisma.$transaction([
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      }),
    ]);

    console.log(`[VERIFY SUCCESS] User ${user.id} verified successfully.`);

    return NextResponse.json(
      {
        message: "Account verified successfully. Welcome to Liz's Grillz Bookings!",
        verified: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[VERIFY ERROR]", error);
    return NextResponse.json(
      { error: "Verification processing failed due to server error." },
      { status: 500 }
    );
  }
}

