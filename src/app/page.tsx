// src/app/page.tsx
import MenuFilter from '@/components/MenuFilter';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">Jonathan’s Café - Testing Dashboard</h1>
          <p className="text-gray-600 mt-2">Use the links and tools below to test the application features.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Column 1: Customer & User Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">User Accounts</h2>
              <div className="bg-white p-6 rounded-lg shadow-md border space-y-3">
                <p className="text-gray-700">Test the sign-up, login, and profile pages.</p>
                <Link href="/auth" className="block text-center w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700">
                  Go to Sign In / Sign Up
                </Link>
                <Link href="/profile" className="block text-center w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
                  View Your Profile (must be logged in)
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Restaurant Admin</h2>
               <div className="bg-white p-6 rounded-lg shadow-md border">
                <p className="text-gray-700 mb-3">View the original password-protected admin dashboard.</p>
                <Link href="/admin" className="block text-center w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
                  Go to Admin Login
                </Link>
              </div>
            </div>
          </div>

          {/* Column 2: Food Passport Demo */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Customer Demo: Food Passport</h2>
            <MenuFilter />
          </div>

        </div>
      </div>
    </main>
  );
}
