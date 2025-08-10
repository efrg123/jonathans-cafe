// src/app/book/page.tsx
import { Suspense } from 'react';
import BookingClientPage from './BookingClientPage';

// This is a Server Component that provides the Suspense boundary
export default function BookPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading booking form...</div>}>
      <BookingClientPage />
    </Suspense>
  );
}
