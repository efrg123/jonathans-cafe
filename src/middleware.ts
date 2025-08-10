// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Get the username and password from the project's environment variables
  const basicAuthUser = 'demo'; // The required username as per the docs
  const basicAuthPass = process.env.DEMO_PASSWORD;

  // If the password isn't set in the environment, we can't protect the route
  if (!basicAuthPass) {
    // You might want to log an error here in a real application
    return NextResponse.json(
      { error: 'Internal Server Error: Auth password not set.' },
      { status: 500 }
    );
  }

  // Get the Authorization header from the incoming request
  const authHeader = req.headers.get('authorization');

  if (authHeader) {
    // The header is in the format "Basic <base64-credentials>"
    // We split it and get the second part
    const auth = authHeader.split(' ')[1];
    // Decode the base64 string
    const [user, pass] = atob(auth).split(':');

    // Check if the provided credentials match the ones from our environment
    if (user === basicAuthUser && pass === basicAuthPass) {
      // If they match, let the request proceed
      return NextResponse.next();
    }
  }

  // If the header is missing or credentials don't match,
  // send back a 401 response WITH the required header to trigger the login prompt.
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