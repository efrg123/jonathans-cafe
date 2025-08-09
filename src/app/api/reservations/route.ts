// src/app/api/reservations/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";             // ← up 3 levels


type ReservationBody = {
  restaurantId: number;
  tableId: number;
  customerName: string;
  partySize: number;
  startsAtISO: string;
  durationMinutes?: number;
  isPrepaid?: boolean;
  prepaidAmount?: number | null;
};

function isReservationBody(x: unknown): x is ReservationBody {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.restaurantId === "number" &&
    typeof o.tableId === "number" &&
    typeof o.customerName === "string" &&
    typeof o.partySize === "number" &&
    typeof o.startsAtISO === "string" &&
    (o.durationMinutes === undefined || typeof o.durationMinutes === "number") &&
    (o.isPrepaid === undefined || typeof o.isPrepaid === "boolean") &&
    (o.prepaidAmount === undefined || o.prepaidAmount === null || typeof o.prepaidAmount === "number")
  );
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    if (!isReservationBody(raw)) {
      return NextResponse.json({ error: "Invalid body." }, { status: 400 });
    }

    const {
      restaurantId,
      tableId,
      customerName,
      partySize,
      startsAtISO,
      durationMinutes = 90,
      isPrepaid = false,
      prepaidAmount = null,
    } = raw;

    const startsAt = new Date(startsAtISO);
    const endsAt = new Date(startsAt.getTime() + Number(durationMinutes) * 60_000);

    // 48-hour rule for prepaid reservations
    if (isPrepaid) {
      const minStart = new Date(Date.now() + 48 * 60 * 60 * 1000);
      if (startsAt < minStart) {
        return NextResponse.json({ error: "Prepaid reservations must be at least 48 hours in advance." }, { status: 400 });
      }
    }

    // Prevent overlapping bookings on the same table
    const overlapping = await prisma.reservation.findFirst({
      where: {
        tableId: Number(tableId),
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { id: true },
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
        prepaidAmount: prepaidAmount === null ? null : Number(prepaidAmount),
      },
    });

    return NextResponse.json({ ok: true, reservation: created }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
