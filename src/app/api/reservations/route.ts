import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      restaurantId, tableId, customerName, partySize,
      startsAtISO, durationMinutes = 90,
      isPrepaid = false, prepaidAmount = null,
    } = body;

    if (!restaurantId || !tableId || !customerName || !partySize || !startsAtISO) {
      return NextResponse.json({ error: "restaurantId, tableId, customerName, partySize, startsAtISO required" }, { status: 400 });
    }

    const startsAt = new Date(startsAtISO);
    const endsAt = new Date(startsAt.getTime() + Number(durationMinutes) * 60_000);

    // 48-hour prepaid rule
    if (isPrepaid) {
      const minStart = new Date(Date.now() + 48 * 60 * 60 * 1000);
      if (startsAt < minStart) {
        return NextResponse.json({ error: "Prepaid reservations must be at least 48 hours in advance." }, { status: 400 });
      }
    }

    // Simple overlap check for same table
    const overlapping = await prisma.reservation.findFirst({
      where: {
        tableId: Number(tableId),
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });
    if (overlapping) {
      return NextResponse.json({ error: "Time slot unavailable for this table." }, { status: 409 });
    }

    const created = await prisma.reservation.create({
      data: {
        restaurantId: Number(restaurantId),
        tableId: Number(tableId),
        customerName,
        partySize: Number(partySize),
        startsAt,
        endsAt,
        status: "confirmed",
        isPrepaid: Boolean(isPrepaid),
        prepaidAmount: prepaidAmount ? Number(prepaidAmount) : null,
      },
    });

    return NextResponse.json({ ok: true, reservation: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
