// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
      <div className="p-8">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800">
          Welcome to Jonathan's Cafe
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          The all-in-one restaurant management MVP.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth" className="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition duration-300">
            Login
          </Link>
          <Link href="/admin/menu" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}