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
          try { cookieStore.set({ name, value, ...options }); } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch (error) {}
        },
      },
    }
  );

  try {
    // 1. Get the logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to access this.' }, { status: 401 });
    }

    // 2. Find the restaurant owned by this user
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        ownerId: user.id,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'You do not own a restaurant.' }, { status: 403 });
    }

    // 3. Fetch the menu for that specific restaurant
    const menuItems = await prisma.menu.findMany({
      where: {
        restaurantId: restaurant.id,
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
