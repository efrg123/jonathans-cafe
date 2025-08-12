// app/api/tables/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET function...
export async function GET() {
    // ... (This function remains the same)
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { restaurant: { select: { id: true } } }
    });
    if (!userProfile?.restaurant?.id) { return NextResponse.json({ error: 'User is not associated with a restaurant' }, { status: 403 }); }
    try {
        const tables = await prisma.table.findMany({
            where: { restaurantId: userProfile.restaurant.id },
            orderBy: { number: 'asc' }
        });
        return NextResponse.json(tables, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch tables:", error);
        return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
    }
}

// POST function...
const tableSchema = z.object({
    number: z.number().int().positive(),
    capacity: z.number().int().positive(),
});
export async function POST(request: Request) {
    // ... (This function remains the same)
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, restaurant: { select: { id: true } } }
    });
    if (userProfile?.role !== 'OWNER' || !userProfile.restaurant?.id) { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }
    const json = await request.json();
    const result = tableSchema.safeParse(json);
    if (!result.success) { return NextResponse.json({ error: 'Invalid input data' }, { status: 400 }); }
    try {
        const newTable = await prisma.table.create({
            data: {
                number: result.data.number,
                capacity: result.data.capacity,
                restaurantId: userProfile.restaurant.id,
            },
        });
        return NextResponse.json(newTable, { status: 201 });
    } catch (error) {
        console.error("Failed to create table:", error);
        return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
    }
}

// DELETE function...
export async function DELETE(request: NextRequest) {
    // ... (This function remains the same)
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, restaurant: { select: { id: true } } }
    });
    if (userProfile?.role !== 'OWNER' || !userProfile.restaurant?.id) { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }
    const tableId = request.nextUrl.searchParams.get('id');
    if (!tableId) { return NextResponse.json({ error: 'Table ID is required' }, { status: 400 }); }
    try {
        const tableIdNum = parseInt(tableId, 10);
        const tableToDelete = await prisma.table.findUnique({ where: { id: tableIdNum } });
        if (!tableToDelete || tableToDelete.restaurantId !== userProfile.restaurant.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        await prisma.table.delete({ where: { id: tableIdNum } });
        return NextResponse.json({ message: 'Table deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error("Failed to delete table:", error);
        return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
    }
}

// --- NEW: PATCH function to update a table ---
const updateTableSchema = z.object({
    id: z.number(),
    number: z.number().int().positive(),
    capacity: z.number().int().positive(),
});

export async function PATCH(request: Request) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, restaurant: { select: { id: true } } }
    });

    if (userProfile?.role !== 'OWNER' || !userProfile.restaurant?.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const json = await request.json();
    const result = updateTableSchema.safeParse(json);
    if (!result.success) {
        return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const { id, number, capacity } = result.data;

    try {
        // Security check: ensure the table to be updated belongs to the owner's restaurant
        const tableToUpdate = await prisma.table.findUnique({ where: { id } });
        if (!tableToUpdate || tableToUpdate.restaurantId !== userProfile.restaurant.id) {
            return NextResponse.json({ error: 'Forbidden: Table not found or you do not own this table' }, { status: 403 });
        }

        // Update the table
        const updatedTable = await prisma.table.update({
            where: { id },
            data: { number, capacity },
        });

        return NextResponse.json(updatedTable, { status: 200 });
    } catch (error) {
        console.error("Failed to update table:", error);
        return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
    }
}