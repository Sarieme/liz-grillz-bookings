import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, extractClientIp } from "@/lib/rate-limiter";

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

    return NextResponse.json(
      {
        message: "Registration successful. Welcome to Liz's Grillz Bookings!",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          organizationType: user.organizationType,
        },
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
