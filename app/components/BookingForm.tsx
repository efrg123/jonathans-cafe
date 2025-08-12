// app/components/BookingForm.tsx
"use client";

import { FormEvent, useState } from "react";

// We receive the restaurantId as a prop
export default function BookingForm({ restaurantId }: { restaurantId: number }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
        customerName: formData.get('customerName') as string,
        partySize: parseInt(formData.get('partySize') as string, 10),
        bookingDate: formData.get('bookingDate') as string,
        bookingTime: formData.get('bookingTime') as string,
        restaurantId: restaurantId,
    };

    const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        setSuccess("Booking confirmed! A table has been reserved for you.");
        (event.target as HTMLFormElement).reset();
    } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create your booking.");
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-lg">
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Book a Table</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="customerName" id="customerName" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div>
                    <label htmlFor="partySize" className="block text-sm font-medium text-gray-700">Party Size</label>
                    <input type="number" name="partySize" id="partySize" min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div>
                    <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" name="bookingDate" id="bookingDate" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div>
                    <label htmlFor="bookingTime" className="block text-sm font-medium text-gray-700">Time</label>
                    <input type="time" name="bookingTime" id="bookingTime" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                    {isLoading ? 'Finding a table...' : 'Request Booking'}
                </button>
                {success && <p className="text-green-600 mt-4 text-center">{success}</p>}
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </form>
        </div>
    </div>
  );
}