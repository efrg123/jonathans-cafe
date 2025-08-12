// app/restaurant/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// Define types for our data
interface Menu {
  id: number;
  name: string;
  description: string | null;
  price: number;
}
interface Restaurant {
  id: number;
  name: string;
  menus: Menu[];
}

// Fetch the specific restaurant and its menu from the database
async function getRestaurantMenu(restaurantId: number): Promise<Restaurant | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      menus: {
        where: { isAvailable: true }, // Only show available items
        orderBy: { name: 'asc' },
      },
    },
  });
  return restaurant;
}


export default async function RestaurantMenuPage({ params }: { params: { id: string } }) {
  const restaurantId = parseInt(params.id, 10);
  const restaurant = await getRestaurantMenu(restaurantId);

  if (!restaurant) {
    return (
        <div className="container mx-auto p-8 text-center">
            <h1 className="text-3xl font-bold">Restaurant not found.</h1>
            <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                &larr; Back to all restaurants
            </Link>
        </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-600">
            &larr; All Restaurants
          </Link>
          <div className="text-right">
             <h1 className="text-3xl font-extrabold text-gray-900">{restaurant.name}</h1>
             <p className="mt-1 text-lg text-gray-500">Menu</p>
          </div>
          {/* --- NEW: Book a Table Button --- */}
          <Link href={`/book/${restaurant.id}`} className="bg-green-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-700 transition-colors">
            Book a Table
          </Link>
        </div>
      </header>

      {/* Menu List */}
      <main className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurant.menus.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600 mt-2">{item.description}</p>
                </div>
                <p className="text-lg font-semibold text-gray-800 ml-4">${item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}