// src/components/BookingForm.tsx
"use client";

import { useState, useEffect } from 'react';

// Define the structure of a Menu item
interface MenuItem {
  id: number;
  name: string;
  price: number;
}

// Define the structure of the API response for a price quote
interface PriceQuote {
  basePrice: number;
  adjustmentPercent: number;
  finalPrice: number;
  ruleName: string | null;
}

export default function BookingForm({ restaurantId }: { restaurantId: number }) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2025-08-15'); // Default to a Friday for easy testing
  const [selectedTime, setSelectedTime] = useState<string>('18:00'); // Default to a happy hour time
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const seededMenus: MenuItem[] = [
      { id: 1, name: 'Classic Burger', price: 12.99 },
      { id: 2, name: 'Veggie Wrap', price: 9.99 },
      { id: 3, name: 'Grilled Chicken Salad', price: 14.50 },
    ];
    setMenus(seededMenus);
    if (seededMenus.length > 0) {
      setSelectedMenuId(seededMenus[0].id.toString());
    }
  }, [restaurantId]);

  const handleGetQuote = async () => {
    if (!selectedMenuId || !selectedDate || !selectedTime) {
      setError('Please select a menu item, date, and time.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuote(null);

    // FIX: Send the local date and time string directly
    const whenLocal = `${selectedDate}T${selectedTime}:00`;

    try {
      const response = await fetch('/api/price-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          menuId: parseInt(selectedMenuId),
          whenLocal, // Use the local time string
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch price quote');
      }

      const data: PriceQuote = await response.json();
      setQuote(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Get a Price Quote</h2>
      
      <div className="mb-4">
        <label htmlFor="menu" className="block text-sm font-medium text-gray-700 mb-1">Menu Item</label>
        <select
          id="menu"
          value={selectedMenuId}
          onChange={(e) => setSelectedMenuId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
        >
          {menus.map((menu) => (
            <option key={menu.id} value={menu.id}>
              {menu.name} - ${menu.price.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="time"
            id="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <button
        onClick={handleGetQuote}
        disabled={isLoading}
        className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400"
      >
        {isLoading ? 'Getting Price...' : 'Get Price Quote'}
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
