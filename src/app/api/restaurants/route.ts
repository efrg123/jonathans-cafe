// src/app/api/restaurants/route.ts
export const runtime = 'nodejs'; // Prisma needs the Node runtime

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // path: from api/restaurants → lib

export async function GET() {
  // return the list of restaurants
  const restaurants = await prisma.restaurant.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(restaurants);
}
