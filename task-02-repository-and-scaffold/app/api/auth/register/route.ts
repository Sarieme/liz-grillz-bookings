import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, extractClientIp } from "@/lib/rate-limiter";
import { checkPwnedPassword } from "@/lib/pwned-passwords";
import {
  generateVerificationCode,
  hashVerificationCode,
  sendVerificationEmailSync,
  enqueueVerificationEmail,
} from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    const clientIp = extractClientIp(request);

    // Step 8: Rate Limiting Enforcement (5 registration requests per 15 minutes)
    const rateCheck = checkRateLimit(`register_${clientIp}`, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
    });

    if (!rateCheck.success) {
      console.log(
        `[429 RATE LIMIT EXCEEDED] Registration locked for IP ${clientIp} for ${rateCheck.retryAfterSec}s`
      );
      return NextResponse.json(
        {
          error:
            "Too many registration attempts from this IP address. Please wait 15 minutes before trying again.",
          retryAfterSec: rateCheck.retryAfterSec,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSec),
            "X-RateLimit-Limit": String(rateCheck.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await request.json();
    const { fullName, email, phone, password, organizationType } = body;

    // Normalisation and trimming
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const trimmedPassword = String(password || "").trim();
    const cleanFullName = String(fullName || "").trim();
    const cleanPhone = String(phone || "").trim();

    if (!cleanFullName || !normalizedEmail || !cleanPhone || !trimmedPassword) {
      return NextResponse.json(
        { error: "All required registration fields must be provided." },
        { status: 400 }
      );
    }

    if (trimmedPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters in length." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Step 9: Breached Password Check using k-Anonymity (registration only)
    const pwned = await checkPwnedPassword(trimmedPassword);
    if (pwned.breached) {
      console.log(
        `[BREACH DETECTED] Password rejected: found ${pwned.count.toLocaleString()} times in HIBP database.`
      );
      return NextResponse.json(
        {
          error: `This password has appeared in ${pwned.count.toLocaleString()} known data breaches and cannot be used. Please choose a more secure password.`,
        },
        { status: 400 }
      );
    }

    // Hash with bcrypt work factor 12
    const passwordHash = await bcrypt.hash(trimmedPassword, 12);

    const user = await prisma.user.create({
      data: {
        fullName: cleanFullName,
        email: normalizedEmail,
        phone: cleanPhone,
        passwordHash,
        organizationType: organizationType || "Individual",
        isVerified: false,
      },
    });

    console.log(
      `[AUTH 201] User registered: ID=${user.id}, NormalizedEmail=${user.email} | IP=${clientIp}`
    );

    // Step 10: Generate 6-digit cryptographic code & persist with 10-minute expiry
    const rawCode = generateVerificationCode();
    const codeHash = hashVerificationCode(rawCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
        attempts: 0,
        used: false,
      },
    });

    console.log(
      `[VERIFICATION CODE GENERATED] User=${user.email}, PlainCode=${rawCode}, ExpiresAt=${expiresAt.toISOString()}`
    );

    // Check delivery mode (sync query param or default background job)
    const url = new URL(request.url);
    const isSyncDelivery = url.searchParams.get("sync") === "true";

    const emailStartTime = performance.now();
    let emailTimingMs = "0.00";

    if (isSyncDelivery) {
      // Synchronous delivery: blocks inside the HTTP request
      await sendVerificationEmailSync(user.email, user.fullName, rawCode);
      emailTimingMs = (performance.now() - emailStartTime).toFixed(2);
      console.log(`[SYNC EMAIL] Delivered in ${emailTimingMs}ms`);
    } else {
      // Asynchronous background job: non-blocking
      enqueueVerificationEmail(user.email, user.fullName, rawCode);
      emailTimingMs = (performance.now() - emailStartTime).toFixed(2);
    }

    return NextResponse.json(
      {
        message: "Registration successful. Please verify your email with the 6-digit code.",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          organizationType: user.organizationType,
          verificationCodePreview: rawCode, // Surfaced in development for test flows
        },
        deliveryMode: isSyncDelivery ? "synchronous" : "background_job",
        emailDeliveryDurationMs: emailTimingMs,
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Limit": String(rateCheck.limit),
          "X-RateLimit-Remaining": String(rateCheck.remaining),
        },
      }
    );
  } catch (error: any) {
    console.error("[REGISTER ERROR]", error);
    return NextResponse.json(
      { error: "Registration failed due to a server error." },
      { status: 500 }
    );
  }
}
