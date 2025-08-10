// src/app/auth/page.tsx
import AuthForm from '@/components/AuthForm';

export default function AuthPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">Welcome</h1>
          <p className="text-gray-600 mt-2">Sign in or create an account to continue</p>
        </div>
        
        <AuthForm />
      </div>
    </main>
  );
}
