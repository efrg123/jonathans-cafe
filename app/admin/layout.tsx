// app/admin/layout.tsx
import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/menu" className="block px-4 py-2 rounded-lg hover:bg-gray-700">
            Menu Management
          </Link>
          <Link href="/admin/tables" className="block px-4 py-2 rounded-lg hover:bg-gray-700">
            Table Management
          </Link>
          <Link href="/admin/pricing-rules" className="block px-4 py-2 rounded-lg hover:bg-gray-700">
            Pricing Rules
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <form action="/auth/logout" method="post">
            <button type="submit" className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-700">
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}