import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const rid = req.nextUrl.searchParams.get("restaurantId");
  if (!rid) return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
  try {
    const tables = await prisma.table.findMany({
      where: { restaurantId: Number(rid) },
      select: { id: true, number: true, restaurantId: true }, // removed seats
      orderBy: { number: "asc" },
    });
    return NextResponse.json({ tables });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load tables" }, { status: 500 });
  }
}
