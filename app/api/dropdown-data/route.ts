// app/api/dropdown-data/route.ts

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { restaurant: { select: { id: true } } }
    });

    if (!userProfile?.restaurant?.id) {
        return NextResponse.json({ error: 'User is not associated with a restaurant' }, { status: 403 });
    }

    try {
        const tables = await prisma.table.findMany({
            where: { restaurantId: userProfile.restaurant.id },
            orderBy: { number: 'asc' }
        });

        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ tables, categories }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
        return NextResponse.json({ error: 'Failed to fetch dropdown data' }, { status: 500 });
    }
}