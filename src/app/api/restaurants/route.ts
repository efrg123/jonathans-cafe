export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, name: true, location: true },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(restaurants);
}
