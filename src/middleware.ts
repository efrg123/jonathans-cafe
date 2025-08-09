import { NextResponse } from "next/server";

export const config = { matcher: ["/admin/:path*"] };

export function middleware(req: Request) {
  const pass = process.env.DEMO_PASSWORD || "";
  if (!pass) return NextResponse.next(); // disabled if not set

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const decoded = atob(auth.split(" ")[1] || "");
    const [user, pwd] = decoded.split(":");
    if (user === "demo" && pwd === pass) return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}
