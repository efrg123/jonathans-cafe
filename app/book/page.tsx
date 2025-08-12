// app/book/[restaurantId]/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BookingForm from '@/components/BookingForm';

async function getRestaurant(restaurantId: number) {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { name: true }
    });
    return restaurant;
}

export default async function BookingPage({ params }: { params: { restaurantId: string } }) {
  const restaurantId = parseInt(params.restaurantId, 10);
  const restaurant = await getRestaurant(restaurantId);

  return (
    <div>
        <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href={`/restaurant/${params.restaurantId}`} className="text-xl font-bold text-gray-800 hover:text-gray-600">
                    &larr; Back to Menu
                </Link>
                 <h1 className="text-2xl font-bold text-gray-700">
                    Booking for: {restaurant?.name || 'Restaurant'}
                </h1>
            </div>
        </header>
        <main className="container mx-auto p-8 flex justify-center">
            <BookingForm restaurantId={restaurantId} />
        </main>
    </div>
  );
}