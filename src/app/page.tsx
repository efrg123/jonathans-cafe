// src/app/page.tsx
import BookingForm from '@/components/BookingForm';

export default function Home() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">Jonathan’s Café</h1>
          <p className="text-gray-600 mt-2">
            Go to <a href="/admin" className="text-teal-600 hover:underline">/admin</a> to view data, or{" "}
            <a href="/restaurants" className="text-teal-600 hover:underline">/restaurants</a> to explore.
          </p>
        </div>
        
        {/* Add the new component here, passing the restaurant ID */}
        <BookingForm restaurantId={1} />
      </div>
    </main>
  );
}
