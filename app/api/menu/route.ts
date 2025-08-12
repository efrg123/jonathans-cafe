import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // This line fixes the issue

// --- POST function (for creating items) ---
const menuItemSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().optional(),
    price: z.number().positive({ message: "Price must be a positive number" }),
    categoryId: z.number(),
});
export async function POST(request: Request) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { restaurantId: true, role: true }
    });
    if (userProfile?.role !== 'OWNER' || !userProfile.restaurantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const json = await request.json();
    const result = menuItemSchema.safeParse(json);
    if (!result.success) {
        return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }
    try {
        const newItem = await prisma.menuItem.create({
            data: {
                name: result.data.name,
                description: result.data.description,
                price: result.data.price,
                categoryId: result.data.categoryId,
                restaurantId: userProfile.restaurantId,
            },
        });
        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error("Failed to create menu item:", error);
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}
// DELETE function remains the same...
export async function DELETE(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { restaurantId: true, role: true }
    });
    if (userProfile?.role !== 'OWNER' || !userProfile.restaurantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const itemId = request.nextUrl.searchParams.get('id');
    if (!itemId) {
        return NextResponse.json({ error: 'Menu item ID is required' }, { status: 400 });
    }
    try {
        const itemIdNum = parseInt(itemId, 10);
        const itemToDelete = await prisma.menuItem.findUnique({ where: { id: itemIdNum } });
        if (!itemToDelete) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        if (itemToDelete.restaurantId !== userProfile.restaurantId) {
            return NextResponse.json({ error: 'Forbidden: You do not own this item' }, { status: 403 });
        }
        await prisma.menuItem.delete({ where: { id: itemIdNum } });
        return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error("Failed to delete menu item:", error);
        return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }
}

