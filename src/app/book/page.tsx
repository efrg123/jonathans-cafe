// src/app/book/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

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

export default function BookPage() {
  const searchParams = useSearchParams();

  // State for UI
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for user selections
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('2025-08-15');
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [customerName, setCustomerName] = useState('');
  const [partySize, setPartySize] = useState(2);

  // 1. Read initial restaurant and menu from URL
  useEffect(() => {
    const restaurantIdFromUrl = searchParams.get('restaurantId');
    const menuIdFromUrl = searchParams.get('menuId');
    if (restaurantIdFromUrl) {
      setSelectedRestaurantId(restaurantIdFromUrl);
    }
    if (menuIdFromUrl) {
      setSelectedMenuId(menuIdFromUrl);
    }
  }, [searchParams]);

  // 2. Fetch all restaurants on initial load
  useEffect(() => {
    async function fetchRestaurants() {
      const res = await fetch('/api/restaurants');
      const data = await res.json();
      setRestaurants(data);
      // If no restaurant is selected from URL, default to the first one
      if (!selectedRestaurantId && data.length > 0) {
        setSelectedRestaurantId(data[0].id.toString());
      }
    }
    fetchRestaurants();
  }, [selectedRestaurantId]); // Re-fetch if ID from URL was invalid

  // 3. Fetch the menu for the selected restaurant
  useEffect(() => {
    if (!selectedRestaurantId) return;

    async function fetchMenus() {
      const res = await fetch(`/api/menus?restaurantId=${selectedRestaurantId}`);
      const data = await res.json();
      setMenus(data);
      // If no menu is selected from URL, default to the first one
      if (!selectedMenuId && data.length > 0) {
        setSelectedMenuId(data[0].id.toString());
      }
    }
    fetchMenus();
  }, [selectedRestaurantId, selectedMenuId]);

  // Handler for getting a price quote
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
      if (!response.ok) throw new Error('Failed to get quote');
      const data = await response.json();
      setQuote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler for creating the final reservation
  const handleBookNow = async () => {
     if (!selectedRestaurantId || !selectedMenuId || !selectedDate || !selectedTime || !customerName || !partySize) {
      setError('Please fill out all fields before booking.');
      return;
    }
    setIsLoading(true);
    setError(null);
    const startsAtISO = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                restaurantId: parseInt(selectedRestaurantId),
                tableId: 1, // Hardcoded for now, would be dynamic in a real app
                customerName: customerName,
                partySize: partySize,
                startsAtISO: startsAtISO,
                userId: user?.id // Attach user ID if logged in
            })
        });
        if (!response.ok) throw new Error('Failed to create reservation');
        setSuccessMessage('Booking confirmed! Check your profile for details.');
    } catch(err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
        setIsLoading(false);
    }
  }

  if (successMessage) {
    return (
        <div className="text-center p-10">
            <h2 className="text-2xl font-bold text-green-600">Success!</h2>
            <p className="text-gray-700 mt-2">{successMessage}</p>
            <a href="/profile" className="text-teal-600 hover:underline mt-4 inline-block">View My Bookings</a>
        </div>
    )
  }

  return (
    <main className="container mx-auto p-4">
        <div className="bg-white p-6 rounded-lg shadow-md border max-w-lg mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">Book a Table</h2>
        <div className="space-y-4">
            {/* Restaurant & Menu */}
            <div>
                <label className="block text-sm font-medium">Restaurant</label>
                <select value={selectedRestaurantId} onChange={e => setSelectedRestaurantId(e.target.value)} className="w-full p-2 border rounded">
                    {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">Menu Item</label>
                <select value={selectedMenuId} onChange={e => setSelectedMenuId(e.target.value)} className="w-full p-2 border rounded">
                    {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Date</label>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Time</label>
                    <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full p-2 border rounded" />
                </div>
            </div>
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Your Name</label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Party Size</label>
                    <input type="number" value={partySize} onChange={e => setPartySize(parseInt(e.target.value))} className="w-full p-2 border rounded" />
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-4">
            <button onClick={handleGetQuote} disabled={isLoading} className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300">
                {isLoading ? '...' : 'Get Quote'}
            </button>
            <button onClick={handleBookNow} disabled={isLoading} className="flex-1 bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700">
                {isLoading ? '...' : 'Book Now'}
            </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        {quote && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold">Price Quote:</h3>
                <p>Final Price: ${quote.finalPrice.toFixed(2)} {quote.ruleName && `(${quote.ruleName})`}</p>
            </div>
        )}
        </div>
    </main>
  );
}
