// src/app/api/menu-with-tags/route.ts
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
    const menuWithTags = await prisma.menu.findMany({
      where: {
        restaurantId: parseInt(restaurantId),
      },
      include: {
        // This is the key part: include the related tags for each menu item
        tags: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(menuWithTags);
  } catch (error) {
    console.error(`Error fetching menu with tags for restaurant ${restaurantId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}
