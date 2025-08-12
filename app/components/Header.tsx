// app/components/Header.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Header() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();

  let userRole: string | null = null;
  if (session) {
    const userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    userRole = userProfile?.role || null;
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Jonathan&apos;s Cafe System
        </Link>
        <nav className="flex items-center gap-4">
          {userRole === 'OWNER' && (
            <Link href="/admin/menu" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
              Admin Dashboard
            </Link>
          )}
          
          {session ? (
            <form action="/auth/logout" method="post">
              <button type="submit" className="text-gray-600 hover:text-blue-600">
                Logout
              </button>
            </form>
          ) : (
            <Link href="/auth" className="text-gray-600 hover:text-blue-600">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}