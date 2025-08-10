// src/app/api/my-bookings/route.ts
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
          } catch (error) {
            // This can be ignored if you have middleware refreshing sessions
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // @ts-expect-error - Workaround for type issue in Next.js canary
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // This can be ignored if you have middleware refreshing sessions
          }
        },
      },
    }
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        startsAt: 'desc',
      },
      include: {
        restaurant: {
          select: { name: true },
        },
        table: {
          select: { number: true },
        },
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}
