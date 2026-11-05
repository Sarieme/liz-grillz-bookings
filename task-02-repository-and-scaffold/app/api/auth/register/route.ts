import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
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

    console.log(`[AUTH 201] User registered: ID=${user.id}, NormalizedEmail=${user.email}`);

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
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[REGISTER ERROR]", error);
    return NextResponse.json(
      { error: "Registration failed due to a server error." },
      { status: 500 }
    );
  }
}

