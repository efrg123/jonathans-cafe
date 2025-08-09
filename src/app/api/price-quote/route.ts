// src/app/api/price-quote/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";             // ← up 3 levels
import { getAdjustmentPercent, applyAdjustment } from "../../../lib/pricing"; // ← up 3


type PriceQuoteBody = {
  restaurantId: number;
  tableId?: number | null;
  whenISO?: string;
  menuId?: number;
  menuPrice?: number;
};

function isPriceQuoteBody(x: unknown): x is PriceQuoteBody {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  if (typeof o.restaurantId !== "number") return false;
  if (o.tableId !== undefined && o.tableId !== null && typeof o.tableId !== "number") return false;
  if (o.menuId === undefined && typeof o.menuPrice !== "number") return false; // require one of them
  if (o.menuId !== undefined && typeof o.menuId !== "number") return false;
  if (o.whenISO !== undefined && typeof o.whenISO !== "string") return false;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    if (!isPriceQuoteBody(raw)) {
      return NextResponse.json({ error: "Invalid body." }, { status: 400 });
    }

    const { restaurantId, tableId = null, whenISO, menuId, menuPrice } = raw;
    const when = whenISO ? new Date(whenISO) : new Date();

    const basePrice =
      typeof menuPrice === "number"
        ? Number(menuPrice)
        : (
            await prisma.menu.findFirstOrThrow({
              where: { id: Number(menuId), restaurantId: Number(restaurantId) },
              select: { price: true },
            })
          ).price;

    const adj = await getAdjustmentPercent(prisma, {
      restaurantId: Number(restaurantId),
      tableId: tableId === null ? null : Number(tableId),
      when,
    });

    const finalPrice = applyAdjustment(Number(basePrice), adj);

    return NextResponse.json({
      basePrice: Number(basePrice),
      adjustmentPercent: adj,
      finalPrice,
      at: when.toISOString(),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
