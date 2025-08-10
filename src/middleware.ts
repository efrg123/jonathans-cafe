// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // NOTE: The check for '/api' is now removed from here
  // because the new 'matcher' config below handles it.

  const basicAuthUser = 'demo';
  const basicAuthPass = process.env.DEMO_PASSWORD;

  if (!basicAuthPass) {
    return NextResponse.json(
      { error: 'Internal Server Error: Auth password not set.' },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get('authorization');

  if (authHeader) {
    const auth = authHeader.split(' ')[1];
    const [user, pass] = atob(auth).split(':');

    if (user === basicAuthUser && pass === basicAuthPass) {
      return NextResponse.next();
    }
  }

  // If auth fails, send the login prompt
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="protected"',
    },
  });
}

// NEW, MORE ROBUST CONFIG:
// This tells the middleware to run on EVERYTHING EXCEPT specific paths.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};