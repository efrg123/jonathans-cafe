// src/app/api/menus/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');

  if (!restaurantId) {
    return NextResponse.json(
      { error: 'restaurantId query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const menus = await prisma.menu.findMany({
      where: {
        restaurantId: parseInt(restaurantId),
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(menus);
  } catch (error) {
    console.error(`Error fetching menu for restaurant ${restaurantId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}
