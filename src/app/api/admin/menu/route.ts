// src/app/api/admin/menu/route.ts
import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // @ts-expect-error - Workaround for type issue in Next.js canary
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { 
            // @ts-expect-error - Workaround for type issue in Next.js canary
            cookieStore.set({ name, value, ...options }); 
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { 
            // @ts-expect-error - Workaround for type issue in Next.js canary
            cookieStore.set({ name, value: '', ...options }); 
          } catch (error) {}
        },
      },
    }
  );

  try {
    // 1. Check if a user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to access this.' }, { status: 401 });
    }

    // 2. For the MVP, fetch the menu for a hardcoded restaurant (Jonathan's Cafe)
    // TODO: In the future, get the restaurantId associated with the logged-in user
    const restaurantId = 1; 

    const menuItems = await prisma.menu.findMany({
      where: {
        restaurantId: restaurantId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching admin menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
}
