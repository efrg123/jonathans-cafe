// app/auth/page.tsx

"use client";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();

    // Listen for authentication events (like successful login)
    supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
            // Redirect to the homepage after successful sign-in
            router.push('/');
            router.refresh(); // Refresh the page to update server components
        }
    });

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    theme="dark"
                    providers={['google', 'github']} // Optional: Add social logins
                    redirectTo="http://localhost:3000/auth/callback"
                />
            </div>
        </div>
    );
}
