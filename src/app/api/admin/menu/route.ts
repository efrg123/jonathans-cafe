// src/app/api/admin/menu/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { prisma } from '@/lib/prisma';

// NOTE: We no longer need the complex cookie handler here

export async function GET(request: Request) {
  // 1. Extract the token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
  }
  const jwt = authHeader.split(' ')[1];

  // 2. Create a temporary Supabase client to validate the token
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 3. Get the user associated with the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 4. Find the restaurant owned by this user
    const restaurant = await prisma.restaurant.findUnique({ where: { ownerId: user.id } });
    if (!restaurant) {
      return NextResponse.json({ error: 'You do not own a restaurant.' }, { status: 403 });
    }

    // 5. Fetch the menu for that specific restaurant
    const menuItems = await prisma.menu.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching admin menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu data' }, { status: 500 });
  }
}
