import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Normalisation and trimming
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const trimmedPassword = String(password || "").trim();

    if (!normalizedEmail || !trimmedPassword) {
      return NextResponse.json(
        { error: "Invalid email or password combination." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Anti-enumeration: Return generic error rather than "User not found"
      console.log(`[AUTH 401] Login failed: User not found for email ${normalizedEmail}`);
      return NextResponse.json(
        { error: "Invalid email or password combination." },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(trimmedPassword, user.passwordHash);

    if (!passwordMatches) {
      console.log(`[AUTH 401] Login failed: Incorrect password for user ${user.id}`);
      return NextResponse.json(
        { error: "Invalid email or password combination." },
        { status: 401 }
      );
    }

    console.log(`[AUTH 200] Login successful: User ${user.id} (${user.email})`);

    return NextResponse.json(
      {
        message: "Sign in successful. Welcome back!",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          organizationType: user.organizationType,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[LOGIN ERROR]", error);
    return NextResponse.json(
      { error: "Authentication failed due to a server error." },
      { status: 500 }
    );
  }
}

