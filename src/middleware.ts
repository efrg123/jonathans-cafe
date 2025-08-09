// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // allow all API routes and public pages
  if (req.nextUrl.pathname.startsWith("/api")) return NextResponse.next();

  const pass = process.env.DEMO_PASSWORD || "";
  const provided =
    req.nextUrl.searchParams.get("pass") ||
    req.headers.get("x-demo-password") ||
    req.cookies.get("demo_pass")?.value;

  if (provided === pass) {
    const res = NextResponse.next();
    if (!req.cookies.get("demo_pass")) {
      res.cookies.set("demo_pass", provided!, { httpOnly: true, path: "/" });
    }
    return res;
  }
  return new NextResponse("Unauthorized", { status: 401 });
}

// only protect /admin
export const config = { matcher: ["/admin/:path*"] };
