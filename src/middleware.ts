import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Internal-only access control middleware
 * 
 * Note: Next.js 16 with Turbopack may show a deprecation warning about using "proxy" instead.
 * This is a known Turbopack quirk - middleware.ts is still the correct and supported way
 * to implement middleware in Next.js. The warning can be safely ignored.
 */
export function middleware(request: NextRequest) {
  const isInternalOnly = process.env.INTERNAL_ONLY_MODE === "true";

  // Allow static assets, API routes, and public pages
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/login"
  ) {
    // Still check internal-only mode for public pages
    if (isInternalOnly && (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/login")) {
      const apiKey = request.headers.get("x-api-key") || request.cookies.get("internal_api_key")?.value;
      const validApiKey = process.env.INTERNAL_API_KEY;

      if (!validApiKey || apiKey !== validApiKey) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Access denied. This application is restricted to internal users only.",
            message: "Please contact your administrator for access."
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }
    return NextResponse.next();
  }

  if (isInternalOnly) {

    // Check for API key in header or cookie
    const apiKey = request.headers.get("x-api-key") || request.cookies.get("internal_api_key")?.value;
    const validApiKey = process.env.INTERNAL_API_KEY;

    // If no valid API key, block access
    if (!validApiKey || apiKey !== validApiKey) {
      // Return 403 Forbidden for unauthorized access
      return new NextResponse(
        JSON.stringify({ 
          error: "Access denied. This application is restricted to internal users only.",
          message: "Please contact your administrator for access."
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Log authorized access
    console.log(`[Access] Authorized: ${request.method} ${request.nextUrl.pathname}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

