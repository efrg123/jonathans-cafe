// app/api/pricing-rules/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// --- MODIFIED: The GET function now includes related table and category data ---
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
        const rules = await prisma.pricingRule.findMany({
            where: {
                restaurantId: userProfile.restaurant.id
            },
            // The "include" option tells Prisma to also fetch the related data
            include: {
                table: true,    // Include the full Table object
                category: true, // Include the full Category object
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(rules, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch pricing rules:", error);
        return NextResponse.json({ error: 'Failed to fetch pricing rules' }, { status: 500 });
    }
}

// ... (The POST and DELETE functions remain the same)
// Zod schema for validating input
const pricingRuleSchema = z.object({
    name: z.string().min(1),
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    adjustmentPercent: z.number().int(),
    tableId: z.number().int().positive().optional().nullable(),
    categoryId: z.number().int().positive().optional().nullable(),
});
export async function POST(request: Request) {
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
    const result = pricingRuleSchema.safeParse(json);
    if (!result.success) { return NextResponse.json({ error: 'Invalid input data', details: result.error.format() }, { status: 400 }); }
    const { name, dayOfWeek, startTime, endTime, adjustmentPercent, tableId, categoryId } = result.data;
    try {
        const newRule = await prisma.pricingRule.create({
            data: {
                name, dayOfWeek, startTime, endTime, adjustmentPercent,
                restaurantId: userProfile.restaurant.id,
                tableId: tableId,
                categoryId: categoryId,
            },
        });
        // Refetch the rule with includes to return the full object
        const newRuleWithIncludes = await prisma.pricingRule.findUnique({
            where: { id: newRule.id },
            include: { table: true, category: true },
        });
        return NextResponse.json(newRuleWithIncludes, { status: 201 });
    } catch (error) {
        console.error("Failed to create pricing rule:", error);
        return NextResponse.json({ error: 'Failed to create pricing rule' }, { status: 500 });
    }
}
export async function DELETE(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, restaurant: { select: { id: true } } }
    });
    if (userProfile?.role !== 'OWNER' || !userProfile.restaurant?.id) { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }
    const ruleId = request.nextUrl.searchParams.get('id');
    if (!ruleId) { return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 }); }
    try {
        const ruleIdNum = parseInt(ruleId, 10);
        const ruleToDelete = await prisma.pricingRule.findUnique({ where: { id: ruleIdNum } });
        if (!ruleToDelete || ruleToDelete.restaurantId !== userProfile.restaurant.id) {
            return NextResponse.json({ error: 'Forbidden: Rule not found or you do not own this rule' }, { status: 403 });
        }
        await prisma.pricingRule.delete({ where: { id: ruleIdNum } });
        return NextResponse.json({ message: 'Rule deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error("Failed to delete rule:", error);
        return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
    }
}