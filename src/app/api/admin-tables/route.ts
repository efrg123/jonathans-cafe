// Lists tables; optionally filter by ?restaurantId=#
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rid = searchParams.get("restaurantId");

    const where = rid ? { restaurantId: Number(rid) } : {};
    const tables = await prisma.table.findMany({
      where,
      select: { id: true, number: true, capacity: true, restaurantId: true },
      orderBy: [{ restaurantId: "asc" }, { number: "asc" }],
    });

    return NextResponse.json(tables);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
