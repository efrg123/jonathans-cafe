// src/components/admin/MenuManager.tsx
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

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
        // 1. Get the user's session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoggedIn(false);
          setIsLoading(false);
          return;
        }
        setIsLoggedIn(true);

        // 2. Make the API call WITH the access token
        const response = await fetch('/api/admin/menu', {
          headers: {
            // 3. Include the token in the Authorization header
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch menu data.');
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
