// src/components/Header.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle the UI update
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        {/* FIX: Replaced the apostrophe with &apos; */}
        <Link href="/" className="text-2xl font-bold text-teal-600">
          Jonathan&apos;s Café
        </Link>
        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                // Links for logged-in users
                <>
                  <Link href="/book" className="text-gray-600 hover:text-teal-600">
                    Book a Table
                  </Link>
                  <Link href="/profile" className="text-gray-600 hover:text-teal-600">
                    My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm hover:bg-gray-300"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                // Link for logged-out users
                <Link href="/auth" className="bg-teal-600 text-white py-2 px-4 rounded-md text-sm hover:bg-teal-700">
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
