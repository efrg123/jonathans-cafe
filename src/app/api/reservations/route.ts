import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    restaurantId,
    tableId,
    customerName,
    partySize,
    startsAtISO,
    durationMinutes,
  } = body ?? {};

  if (!restaurantId || !tableId || !customerName || !partySize || !startsAtISO) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const startsAt = new Date(startsAtISO);
  if (isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "Invalid startsAtISO" }, { status: 400 });
  }

  const dur = Number(durationMinutes);
  const minutes = Number.isFinite(dur) && dur > 0 ? dur : 90; // default 90
  const endsAt = new Date(startsAt.getTime() + minutes * 60_000);

  try {
    const reservation = await prisma.reservation.create({
      data: {
        restaurantId: Number(restaurantId),
        tableId: Number(tableId),
        customerName: String(customerName),
        partySize: Number(partySize),
        startsAt,
        endsAt, // <- required by your schema
      },
      select: { id: true },
    });

    return NextResponse.json({ reservation });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
