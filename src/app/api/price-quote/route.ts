import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { restaurantId, tableId, whenISO, menuPrice } = await req.json();
  if (!restaurantId || !tableId || !whenISO) {
    return NextResponse.json({ error: "restaurantId, tableId, whenISO required" }, { status: 400 });
  }
  const when = new Date(whenISO);
  const hour = when.getUTCHours();
  const day = when.getUTCDay(); // 0=Sun ... 6=Sat

  let adjustmentPercent = 0;
  if ((day === 5 || day === 6) && hour >= 18 && hour <= 22) adjustmentPercent = 25;  // Fri/Sat evening peak
  else if (day >= 1 && day <= 4 && hour < 18) adjustmentPercent = -20;               // Weekday before 6pm off-peak

  const basePrice = menuPrice != null ? Number(menuPrice) : 0;
  const finalPrice = Math.round(basePrice * (1 + adjustmentPercent / 100) * 100) / 100;

  return NextResponse.json({ basePrice, adjustmentPercent, finalPrice });
}
