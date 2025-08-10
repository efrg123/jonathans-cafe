// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface Reservation {
  id: number;
  startsAt: string;
  status: string;
  restaurant: {
    name: string;
  };
  table: {
    number: number;
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserAndBookings() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const response = await fetch('/api/my-bookings');
        if (response.ok) {
          const bookings = await response.json();
          setReservations(bookings);
        }
      }
      setLoading(false);
    }
    getUserAndBookings();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // Redirect to homepage after sign out
  };

  if (loading) {
    return <p className="text-center mt-10">Loading profile...</p>;
  }

  if (!user) {
    return (
      <div className="text-center mt-10">
        <p>You must be logged in to view this page.</p>
        <a href="/auth" className="text-teal-600 hover:underline">Go to Login</a>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-2xl font-semibold mb-4">My Booking History</h2>
          {reservations.length > 0 ? (
            <ul className="space-y-4">
              {reservations.map((res) => (
                <li key={res.id} className="p-4 bg-gray-50 rounded-md border">
                  <p className="font-bold text-lg">{res.restaurant.name}</p>
                  <p className="text-sm text-gray-600">
                    Table #{res.table.number} on {new Date(res.startsAt).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Status: <span className="font-medium capitalize">{res.status}</span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">You have no past or upcoming reservations.</p>
          )}
        </div>
      </div>
    </main>
  );
}
