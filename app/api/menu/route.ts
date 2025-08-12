// app/api/menu/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// --- POST function (for creating items) ---
// ... (This function remains the same)
export async function POST(request: Request) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            role: true,
            restaurant: { select: { id: true } }
        }
    });
    if (userProfile?.role !== 'OWNER' || !userProfile.restaurant?.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const json = await request.json();
    // ... validation and creation logic ...
    try {
        const newItem = await prisma.menu.create({
            data: {
                name: json.name,
                description: json.description,
                price: json.price,
                categoryId: json.categoryId,
                restaurantId: userProfile.restaurant.id,
            },
        });
        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error("Failed to create menu item:", error);
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}

// --- NEW: PATCH function (for updating items) ---
export async function PATCH(request: Request) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            role: true,
            restaurant: { select: { id: true } }
        }
    });

    if (userProfile?.role !== 'OWNER' || !userProfile.restaurant?.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const json = await request.json();
    const { id, name, description, price } = json;

    if (!id) {
        return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    try {
        // Security check: ensure the item being updated belongs to the user's restaurant
        const itemToUpdate = await prisma.menu.findUnique({
            where: { id: id },
        });

        if (!itemToUpdate || itemToUpdate.restaurantId !== userProfile.restaurant.id) {
            return NextResponse.json({ error: 'Forbidden: Item not found or you do not own this item' }, { status: 403 });
        }

        // Update the item
        const updatedItem = await prisma.menu.update({
            where: { id: id },
            data: {
                name,
                description,
                price,
            },
        });

        return NextResponse.json(updatedItem, { status: 200 });
    } catch (error) {
        console.error("Failed to update menu item:", error);
        return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
    }
}


// --- DELETE function (for deleting items) ---
// ... (This function remains the same)
export async function DELETE(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            role: true,
            restaurant: { select: { id: true } }
        }
    });
    if (userProfile?.role !== 'OWNER' || !userProfile.restaurant?.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const itemId = request.nextUrl.searchParams.get('id');
    // ... deletion logic ...
    try {
        const itemIdNum = parseInt(itemId!, 10);
        const itemToDelete = await prisma.menu.findUnique({ where: { id: itemIdNum } });

        if (!itemToDelete || itemToDelete.restaurantId !== userProfile.restaurant.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.menu.delete({ where: { id: itemIdNum } });
        return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error("Failed to delete menu item:", error);
        return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }
}