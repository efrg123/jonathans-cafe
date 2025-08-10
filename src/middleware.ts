// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // **NEW LINE:** If the request is for an API route, do nothing and let it pass.
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Get the username and password from the project's environment variables
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

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="protected"',
    },
  });
}

// This config ensures the middleware only runs on the /admin route
export const config = {
  matcher: ['/admin/:path*'],
};