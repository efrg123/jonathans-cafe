import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAdjustmentPercent, applyAdjustment } from "@/lib/pricing";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, tableId, whenISO, menuId, menuPrice } = body;

    if (!restaurantId || (!menuId && typeof menuPrice !== "number")) {
      return NextResponse.json({ error: "restaurantId and (menuId or menuPrice) required" }, { status: 400 });
    }

    const when = whenISO ? new Date(whenISO) : new Date();
    const basePrice = typeof menuPrice === "number"
      ? Number(menuPrice)
      : (await prisma.menu.findFirstOrThrow({ where: { id: Number(menuId), restaurantId }, select: { price: true } })).price;

    const adj = await getAdjustmentPercent(prisma, { restaurantId: Number(restaurantId), tableId: tableId ? Number(tableId) : null, when });
    const finalPrice = applyAdjustment(basePrice, adj);

    return NextResponse.json({ basePrice, adjustmentPercent: adj, finalPrice, at: when.toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
