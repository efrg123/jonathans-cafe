// app/page.tsx
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Restaurant {
  id: number;
  name: string;
  location: string | null;
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isHalal, setIsHalal] = useState(false);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await fetch('/api/restaurants');
        if (response.ok) {
          const data = await response.json();
          setRestaurants(data);
        } else {
          setError("Failed to fetch restaurants.");
        }
      } catch (err) {
        setError("An error occurred while fetching restaurants.");
      }
      setIsLoading(false);
    }
    fetchRestaurants();
  }, []);

  return (
    // The old header is removed, the main content starts immediately
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg h-fit">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">My Food Passport</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isVegetarian}
                onChange={(e) => setIsVegetarian(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700">Vegetarian</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isHalal}
                onChange={(e) => setIsHalal(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700">Halal</span>
            </label>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900">Select a Restaurant</h2>
            <p className="mt-2 text-lg text-gray-500">
              Choose a location to view the menu. Your Food Passport will be applied automatically.
            </p>
          </div>
          {isLoading ? (
            <p>Loading restaurants...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h3>
                    <p className="text-gray-600 mb-4">{restaurant.location}</p>
                    <Link href={`/restaurant/${restaurant.id}`} className="inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      View Menu
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}