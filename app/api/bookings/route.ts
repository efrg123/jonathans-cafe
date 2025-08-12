// app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Zod schema for validating the booking input
const bookingSchema = z.object({
    customerName: z.string().min(1, { message: "Name is required" }),
    partySize: z.number().int().positive({ message: "Party size must be at least 1" }),
    bookingDate: z.string().min(1, { message: "Date is required" }),
    bookingTime: z.string().min(1, { message: "Time is required" }),
    restaurantId: z.number().int().positive(),
});

export async function POST(request: Request) {
    const json = await request.json();
    const result = bookingSchema.safeParse(json);

    if (!result.success) {
        return NextResponse.json({ error: 'Invalid input data', details: result.error.format() }, { status: 400 });
    }

    const { customerName, partySize, bookingDate, bookingTime, restaurantId } = result.data;

    try {
        // Combine date and time into a single ISO 8601 DateTime string
        const startsAt = new Date(`${bookingDate}T${bookingTime}`);
        // For this MVP, we'll assume a default duration of 90 minutes
        const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000);

        // Find an available table for the requested time
        // This is a simplified logic for the MVP
        const availableTable = await prisma.table.findFirst({
            where: {
                restaurantId: restaurantId,
                capacity: { gte: partySize }, // Find a table with enough capacity
                // Check for overlapping reservations (this is a simplified check)
                reservations: {
                    none: {
                        OR: [
                            { AND: [{ startsAt: { lte: startsAt } }, { endsAt: { gte: startsAt } }] },
                            { AND: [{ startsAt: { lte: endsAt } }, { endsAt: { gte: endsAt } }] },
                            { AND: [{ startsAt: { gte: startsAt } }, { endsAt: { lte: endsAt } }] },
                        ]
                    }
                }
            }
        });

        if (!availableTable) {
            return NextResponse.json({ error: "No available tables for the selected time and party size." }, { status: 409 }); // 409 Conflict
        }

        // Create the reservation
        const newReservation = await prisma.reservation.create({
            data: {
                customerName,
                partySize,
                startsAt,
                endsAt,
                restaurantId: restaurantId,
                tableId: availableTable.id, // Assign the found available table
            },
        });

        return NextResponse.json(newReservation, { status: 201 });
    } catch (error) {
        console.error("Failed to create reservation:", error);
        return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
    }
}