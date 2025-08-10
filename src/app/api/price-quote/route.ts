// src/app/api/price-quote/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// NEW: A simple GET handler for testing
export async function GET() {
  return NextResponse.json({ message: 'Price quote endpoint is alive' });
}

// Define the schema for the incoming request body
const quoteSchema = z.object({
  restaurantId: z.number(),
  menuId: z.number(),
  whenISO: z.string().datetime({ message: 'Invalid ISO 8601 datetime format' }),
});

// Helper function to apply percentage adjustment
function applyAdjustment(basePrice: number, percentage: number): number {
  const finalPrice = basePrice * (1 + percentage / 100);
  // Round to 2 decimal places
  return Math.round(finalPrice * 100) / 100;
}

export async function POST(request: Request) {
  // 1. Validate the incoming request body
  const body = await request.json();
  const result = quoteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: result.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const { restaurantId, menuId, whenISO } = result.data;

    // 2. Get the base price of the menu item
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

    // 3. Find applicable pricing rules
    const when = new Date(whenISO);
    const dayOfWeek = when.getDay(); // 0 (Sun) to 6 (Sat)
    const time = `${when.getHours().toString().padStart(2, '0')}:${when.getMinutes().toString().padStart(2, '0')}`;

    const applicableRule = await prisma.pricingRule.findFirst({
      where: {
        restaurantId: restaurantId,
        dayOfWeek: dayOfWeek,
        startTime: { lte: time }, // Rule starts at or before the requested time
        endTime: { gt: time },   // Rule ends after the requested time
        isActive: true,
      },
    });

    // 4. Apply the rule if one exists
    if (applicableRule) {
      adjustmentPercent = applicableRule.adjustmentPercent;
      finalPrice = applyAdjustment(basePrice, adjustmentPercent);
    }

    // 5. Return the final price quote
    return NextResponse.json({
      basePrice,
      adjustmentPercent,
      finalPrice,
      ruleName: applicableRule?.name || null,
      at: whenISO,
    });
  } catch (e) {
    console.error('Price quote POST error:', e);
    return NextResponse.json({ error: 'Failed to get price quote' }, { status: 500 });
  }
}
