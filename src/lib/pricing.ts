// src/lib/pricing.ts
import { PrismaClient } from "@prisma/client";

export type QuoteInput = {
  restaurantId: number;
  tableId?: number | null;
  when: Date;
};

type Rule = {
  startTime: string;
  endTime: string;
  tableId: number | null;
  adjustmentPercent: number | null;
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
  const dow = when.getDay();
  const hhmm = toHHMM(when);

  const rules = await prisma.pricingRule.findMany({
    where: { restaurantId, dayOfWeek: dow, isActive: true },
  });

  const matches = (rules as Rule[]).filter(
    (r) => r.startTime <= hhmm && hhmm < r.endTime
  );

  const tableMatches = matches.filter(
    (r) => r.tableId != null && tableId != null && r.tableId === tableId
  );

  const pool = tableMatches.length ? tableMatches : matches;
  if (!pool.length) return 0;

  const top = [...pool].sort(
    (a, b) =>
      Math.abs((b.adjustmentPercent ?? 0)) - Math.abs((a.adjustmentPercent ?? 0))
  )[0];

  return top?.adjustmentPercent ?? 0;
}

export function applyAdjustment(base: number, adjPercent: number): number {
  return Math.round((base * (1 + adjPercent / 100)) * 100) / 100;
}
