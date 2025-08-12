// app/api/restaurants/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This line is important to prevent aggressive caching issues
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const restaurants = await prisma.restaurant.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return NextResponse.json(restaurants);
    } catch (error) {
        console.error("Failed to fetch restaurants:", error);
        // Provide a more specific error response
        return NextResponse.json(
            { error: 'An internal server error occurred while fetching restaurants.' }, 
            { status: 500 }
        );
    }
}