import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Invalid JSON body" }, 400);

    const { restaurantId, tableId, customerName, partySize, startsAtISO, durationMinutes } = body;

    if (!restaurantId || !tableId || !customerName || !partySize || !startsAtISO) {
      return json({ error: "Missing required fields" }, 400);
    }

    const startsAt = new Date(startsAtISO);
    if (isNaN(startsAt.getTime())) return json({ error: "Invalid startsAtISO" }, 400);

    const minutes = Number.isFinite(Number(durationMinutes)) && Number(durationMinutes) > 0 ? Number(durationMinutes) : 90;
    const endsAt = new Date(startsAt.getTime() + minutes * 60_000);

    const reservation = await prisma.reservation.create({
      data: {
        restaurantId: Number(restaurantId),
        tableId: Number(tableId),
        customerName: String(customerName),
        partySize: Number(partySize),
        startsAt,
        endsAt,
      },
      select: { id: true },
    });

    return json({ reservation }, 200);
  } catch (e) {
    console.error("reservations POST error:", e);
    return json({ error: "Failed to create reservation" }, 500);
  }
}
