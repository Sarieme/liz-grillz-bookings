import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, phone, eventDate, guestCount, organizationType } = body;

    console.log(`[REQUEST] Incoming booking enquiry from: ${clientName} (${phone})`);

    // Verify required fields
    if (!clientName || !phone || !eventDate || !guestCount) {
      console.log(`[400 Bad Request] Missing required booking fields`);
      return NextResponse.json(
        { error: "Missing required booking details." },
        { status: 400 }
      );
    }

    // Persist to PostgreSQL database
    const booking = await prisma.booking.create({
      data: {
        clientName: String(clientName).trim(),
        phone: String(phone).trim(),
        eventDate: new Date(eventDate),
        guestCount: parseInt(String(guestCount), 10),
        organizationType: organizationType || "Individual",
      },
    });

    console.log(
      `[201 Created] Booking record persisted: ID=${booking.id}, Date=${booking.eventDate.toISOString().slice(0, 10)}, CreatedAt=${booking.createdAt.toISOString()}`
    );

    return NextResponse.json(
      {
        message: "Booking enquiry recorded successfully.",
        booking: {
          id: booking.id,
          clientName: booking.clientName,
          createdAt: booking.createdAt,
        },
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

