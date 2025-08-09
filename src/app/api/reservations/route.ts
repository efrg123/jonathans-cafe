import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    restaurantId, tableId, customerName, partySize,
    startsAtISO, durationMinutes, isPrepaid, prepaidAmount
  } = body ?? {};

  if (!restaurantId || !tableId || !customerName || !partySize || !startsAtISO) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const reservation = await prisma.reservation.create({
      data: {
        restaurantId: Number(restaurantId),
        tableId: Number(tableId),
        customerName: String(customerName),
        partySize: Number(partySize),
        startsAt: new Date(startsAtISO),
        durationMinutes: Number(durationMinutes ?? 90),
        isPrepaid: Boolean(isPrepaid ?? false),
        prepaidAmount: prepaidAmount != null ? Number(prepaidAmount) : null,
      },
      select: { id: true },
    });
    return NextResponse.json({ reservation });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
