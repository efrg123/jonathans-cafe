// src/app/api/price-quote/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Define the schema for the incoming request body
const quoteSchema = z.object({
  restaurantId: z.number(),
  menuId: z.number(),
  // FIX: Expect a simple string, not a full datetime
  whenLocal: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, {
    message: 'Invalid local datetime format. Expected YYYY-MM-DDTHH:MM:SS',
  }),
});

// Helper function to apply percentage adjustment
function applyAdjustment(basePrice: number, percentage: number): number {
  const finalPrice = basePrice * (1 + percentage / 100);
  // Round to 2 decimal places
  return Math.round(finalPrice * 100) / 100;
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = quoteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: result.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const { restaurantId, menuId, whenLocal } = result.data;

    const menuItem = await prisma.menu.findUnique({
      where: { id: menuId, restaurantId: restaurantId },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found for this restaurant' },
        { status: 404 }
      );
    }

    const basePrice = menuItem.price;
    let finalPrice = basePrice;
    let adjustmentPercent = 0;

    // FIX: Create a Date object from the local time string.
    // This correctly interprets the day and time in the server's UTC context.
    const when = new Date(whenLocal + 'Z'); // Append 'Z' to treat it as UTC
    const dayOfWeek = when.getUTCDay(); // Use getUTCDay() for consistency
    const time = `${when.getUTCHours().toString().padStart(2, '0')}:${when.getUTCMinutes().toString().padStart(2, '0')}`;

    const applicableRule = await prisma.pricingRule.findFirst({
      where: {
        restaurantId: restaurantId,
        dayOfWeek: dayOfWeek,
        startTime: { lte: time },
        endTime: { gt: time },
        isActive: true,
      },
    });

    if (applicableRule) {
      adjustmentPercent = applicableRule.adjustmentPercent;
      finalPrice = applyAdjustment(basePrice, adjustmentPercent);
    }

    return NextResponse.json({
      basePrice,
      adjustmentPercent,
      finalPrice,
      ruleName: applicableRule?.name || null,
      at: whenLocal,
    });
  } catch (e) {
    console.error('Price quote POST error:', e);
    return NextResponse.json({ error: 'Failed to get price quote' }, { status: 500 });
  }
}
