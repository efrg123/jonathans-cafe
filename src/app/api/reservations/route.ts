// src/app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Using the recommended path alias
import { z } from 'zod';

// Define the schema for the incoming request body using Zod
const reservationSchema = z.object({
  restaurantId: z.number(),
  tableId: z.number(),
  customerName: z.string().min(1, { message: 'Customer name cannot be empty' }),
  partySize: z.number().gt(0, { message: 'Party size must be greater than 0' }),
  startsAtISO: z.string().datetime({ message: 'Invalid ISO 8601 datetime format' }),
  durationMinutes: z.number().optional(), // duration is optional
});

export async function POST(request: Request) {
  // 1. Validate the incoming request body
  const body = await request.json();
  const result = reservationSchema.safeParse(body);

  // If validation fails, return a 422 error with details
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: result.error.flatten() },
      { status: 422 } // 422 Unprocessable Entity
    );
  }

  // 2. If validation succeeds, proceed with creating the reservation
  try {
    const { restaurantId, tableId, customerName, partySize, startsAtISO, durationMinutes } = result.data;

    const startsAt = new Date(startsAtISO);
    const minutes = durationMinutes || 90; // Default to 90 minutes if not provided
    const endsAt = new Date(startsAt.getTime() + minutes * 60_000);

    // TODO: Add overlap detection logic here before creating

    const reservation = await prisma.reservation.create({
      data: {
        restaurantId,
        tableId,
        customerName,
        partySize,
        startsAt,
        endsAt,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, reservation }, { status: 201 }); // 201 Created
  } catch (e) {
    console.error('Reservations POST error:', e);
    // This could be a database error, like a foreign key constraint failing
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}