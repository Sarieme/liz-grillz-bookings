import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const startTime = performance.now();
  try {
    const body = await request.json();

    // Step 6 & 7: Server-side Zod Schema Validation at the boundary
    const parsed = bookingSchema.safeParse({
      ...body,
      guestCount:
        typeof body.guestCount === "string"
          ? parseInt(body.guestCount, 10)
          : body.guestCount,
    });

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));

      console.log(
        `[400 Bad Request] Server validation rejected direct payload in ${(
          performance.now() - startTime
        ).toFixed(2)}ms:`,
        issues
      );

      return NextResponse.json(
        {
          error: "Payload rejected: Server schema validation failed.",
          issues,
        },
        { status: 400 }
      );
    }

    const valid = parsed.data;

    // Check capacity: max 2 large bookings per day
    const eventDay = new Date(valid.eventDate);
    eventDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(eventDay);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingEventsCount = await prisma.booking.count({
      where: {
        eventDate: {
          gte: eventDay,
          lt: nextDay,
        },
        status: { in: ["CONFIRMED", "PENDING_HOLD"] },
      },
    });

    if (existingEventsCount >= 2) {
      return NextResponse.json(
        {
          error: "Date capacity reached. Liz's Grillz accepts a maximum of two large catering events per day.",
        },
        { status: 409 }
      );
    }

    // Persist to PostgreSQL database
    const booking = await prisma.booking.create({
      data: {
        clientName: valid.clientName,
        phone: valid.phone,
        eventDate: new Date(valid.eventDate),
        guestCount: valid.guestCount,
        organizationType: valid.organizationType,
        packageTier: "StandardParty",
        totalAmount: valid.guestCount * 7500,
        depositRequired: valid.guestCount * 7500 * (valid.organizationType === "Corporate" ? 0.6 : 0.8),
        depositPaid: 0,
        status: "PENDING_HOLD",
        cancellationReason: "N/A - Active",
        holdExpiresAt: new Date(Date.now() + 48 * 3600 * 1000),
        notes: valid.notes || null,
      },
    });

    const elapsedMs = (performance.now() - startTime).toFixed(2);
    console.log(
      `[201 Created] Booking persisted: ID=${booking.id}, Elapsed=${elapsedMs}ms`
    );

    return NextResponse.json(
      {
        message: "Booking enquiry recorded successfully under 48-hour capacity hold.",
        booking: {
          id: booking.id,
          clientName: booking.clientName,
          eventDate: booking.eventDate,
          guestCount: booking.guestCount,
          depositRequired: booking.depositRequired,
          holdExpiresAt: booking.holdExpiresAt,
          createdAt: booking.createdAt,
        },
        serverTimingMs: elapsedMs,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(`[DATABASE ERROR] Failed to record booking:`, error.message);
    return NextResponse.json(
      { error: "Database connection failed or transaction aborted." },
      { status: 500 }
    );
  }
}
