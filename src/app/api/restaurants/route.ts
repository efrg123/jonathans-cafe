import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: { id: true, name: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ restaurants });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load restaurants" }, { status: 500 });
  }
}
