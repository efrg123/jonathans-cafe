import { PrismaClient } from "@prisma/client";

export type QuoteInput = {
  restaurantId: number;
  tableId?: number | null;
  when: Date;            // JS Date in your server timezone (UTC is fine)
};

function toHHMM(d: Date) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export async function getAdjustmentPercent(
  prisma: PrismaClient,
  { restaurantId, tableId, when }: QuoteInput
): Promise<number> {
  const dow = when.getDay();          // 0..6 (Sun..Sat)
  const hhmm = toHHMM(when);

  // Grab all rules for that day; we’ll filter in JS by time window.
  const rules = await prisma.pricingRule.findMany({
    where: { restaurantId, dayOfWeek: dow, isActive: true },
  });

  const matches = rules.filter(r => r.startTime <= hhmm && hhmm < r.endTime);

  // Prefer table-specific; if multiple, take the largest absolute adjustment.
  const tableMatches = matches.filter(r => r.tableId && tableId && r.tableId === tableId);
  const pool = (tableMatches.length ? tableMatches : matches);

  if (!pool.length) return 0;

  return pool.sort((a, b) => Math.abs(b.adjustmentPercent) - Math.abs(a.adjustmentPercent))[0]
             .adjustmentPercent;
}

export function applyAdjustment(base: number, adjPercent: number) {
  return Math.round((base * (1 + adjPercent / 100)) * 100) / 100;
}
