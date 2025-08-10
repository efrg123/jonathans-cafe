// src/components/admin/MenuManager.tsx
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link'; // Import Link

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string | null;
}

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoggedIn(false);
          setIsLoading(false);
          return; // Stop if user is not logged in
        }
        setIsLoggedIn(true);

        const response = await fetch('/api/admin/menu');
        if (response.status === 401) {
            throw new Error('You must be logged in to view this page.');
        }
        if (!response.ok) {
          throw new Error('Failed to fetch menu data.');
        }
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMenu();
  }, []);

  if (isLoading) {
    return <p className="text-center">Loading menu...</p>;
  }

  // If user is not logged in, show a helpful message
  if (!isLoggedIn) {
    return (
        <div className="text-center bg-white p-8 rounded-lg shadow-md border">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You must be signed in to manage the restaurant menu.</p>
            <Link href="/auth" className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700">
                Go to Sign In Page
            </Link>
        </div>
    )
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h2 className="text-2xl font-bold mb-4">Menu Management</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Price</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{item.name}</td>
              <td className="p-2">${item.price.toFixed(2)}</td>
              <td className="p-2">
                <button className="text-sm text-blue-600 hover:underline">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
