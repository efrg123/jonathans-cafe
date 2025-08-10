// src/components/BookingForm.tsx
"use client";

import { useState, useEffect } from 'react';

// Define the structure of our data
interface Restaurant {
  id: number;
  name: string;
}
interface MenuItem {
  id: number;
  name: string;
  price: number;
}
interface PriceQuote {
  basePrice: number;
  adjustmentPercent: number;
  finalPrice: number;
  ruleName: string | null;
}

export default function BookingForm() {
  // State for UI
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for user selections
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('2025-08-15'); // Default to a Friday
  const [selectedTime, setSelectedTime] = useState('18:00'); // Default to a happy hour time

  // 1. Fetch all restaurants when the component first loads
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await fetch('/api/restaurants');
        if (!response.ok) throw new Error('Failed to fetch restaurants');
        const data: Restaurant[] = await response.json();
        setRestaurants(data);
        // If we have restaurants, select the first one by default
        if (data.length > 0) {
          setSelectedRestaurantId(data[0].id.toString());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
    fetchRestaurants();
  }, []);

  // 2. Fetch the menu for the selected restaurant WHENEVER the selection changes
  useEffect(() => {
    if (!selectedRestaurantId) return;

    async function fetchMenus() {
      setIsLoading(true);
      setError(null);
      setMenus([]); // Clear old menu
      try {
        const response = await fetch(`/api/menus?restaurantId=${selectedRestaurantId}`);
        if (!response.ok) throw new Error('Failed to fetch menu');
        const data: MenuItem[] = await response.json();
        setMenus(data);
        // If the new menu has items, select the first one
        if (data.length > 0) {
          setSelectedMenuId(data[0].id.toString());
        } else {
          setSelectedMenuId(''); // No items in this menu
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchMenus();
  }, [selectedRestaurantId]); // This effect re-runs when selectedRestaurantId changes

  const handleGetQuote = async () => {
    if (!selectedRestaurantId || !selectedMenuId || !selectedDate || !selectedTime) {
      setError('Please select all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuote(null);

    const whenLocal = `${selectedDate}T${selectedTime}:00`;

    try {
      const response = await fetch('/api/price-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: parseInt(selectedRestaurantId),
          menuId: parseInt(selectedMenuId),
          whenLocal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch price quote');
      }

      const data: PriceQuote = await response.json();
      setQuote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Get a Price Quote</h2>
      
      <div className="space-y-4">
        {/* Restaurant Selection */}
        <div>
          <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-1">Restaurant</label>
          <select
            id="restaurant"
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          >
            {restaurants.map((res) => (
              <option key={res.id} value={res.id}>{res.name}</option>
            ))}
          </select>
        </div>

        {/* Menu Selection */}
        <div>
          <label htmlFor="menu" className="block text-sm font-medium text-gray-700 mb-1">Menu Item</label>
          <select
            id="menu"
            value={selectedMenuId}
            onChange={(e) => setSelectedMenuId(e.target.value)}
            disabled={menus.length === 0}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          >
            {menus.length > 0 ? (
              menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name} - ${menu.price.toFixed(2)}
                </option>
              ))
            ) : (
              <option>Select a restaurant to see menu</option>
            )}
          </select>
        </div>

        {/* Date and Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleGetQuote}
        disabled={isLoading}
        className="w-full mt-4 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Loading...' : 'Get Price Quote'}
      </button>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      {quote && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800">Price Details</h3>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p className="flex justify-between"><span>Base Price:</span> <span>${quote.basePrice.toFixed(2)}</span></p>
            {quote.adjustmentPercent !== 0 && (
              <>
                <p className="flex justify-between">
                  <span>Discount ({quote.ruleName}):</span> 
                  <span className="text-green-600 font-medium">{quote.adjustmentPercent}%</span>
                </p>
                <hr className="my-2"/>
              </>
            )}
            <p className="flex justify-between text-base font-bold text-gray-900">
              <span>Final Price:</span> 
              <span>${quote.finalPrice.toFixed(2)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
