import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic auth gate — Next 16's "proxy" convention (formerly "middleware").
// Runs on the edge runtime, so it only checks for the *presence* of the
// BetterAuth session cookie (no DB call) — full validation still happens in the
// auth route and server actions. This keeps logged-out visitors out of the
// dashboard and logged-in users off the auth pages, without a per-request
// database round-trip.
const AUTH_PAGES = new Set(["/login", "/signup"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));

  // Logged-out → keep them out of the dashboard.
  if (pathname.startsWith("/dashboard") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged-in → no reason to sit on the login/signup pages.
  if (AUTH_PAGES.has(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/signup"],
};
