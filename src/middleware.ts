import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 🔐 SECURITY-HARDENED MIDDLEWARE
 * 
 * CRITICAL SECURITY RULES (MUST BE ENFORCED):
 * 1. NEVER trust cookies alone - cookie presence ≠ authentication
 * 2. NEVER use localStorage for auth decisions
 * 3. NEVER cache auth results - verify fresh on EVERY request
 * 4. Backend is the ONLY source of truth for login status
 * 5. If backend cannot prove admin is logged in RIGHT NOW → block access
 * 
 * This middleware calls /api/admin/me on EVERY route access to verify
 * current authentication status. No shortcuts. No caching. No trust.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CRITICAL: Exclude Next.js internal routes and static files FIRST
  // These must NEVER be intercepted by middleware
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  
  // Exclude static files by extension
  const staticFileExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.eot', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  if (staticFileExtensions.some(ext => pathname.toLowerCase().endsWith(ext))) {
    return NextResponse.next();
  }

  // ONLY public routes - login and forgot password
  // These are the ONLY routes that don't require authentication
  const publicRoutes = ["/", "/forgot-password"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // For public routes, verify if user is already logged in
  // If logged in and on login page → redirect to dashboard
  if (isPublicRoute) {
    try {
      const verifyUrl = new URL("/api/admin/me", request.url);
      const authToken = request.cookies.get("auth_token");
      
      // Only verify if cookie exists (optimization)
      if (authToken?.value) {
        const tokenValue = authToken.value;
        const response = await fetch(verifyUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${tokenValue}`,
            Cookie: request.headers.get("cookie") || "",
          },
        });

        // If logged in and on login page → redirect to dashboard
        if (response.ok && pathname === "/") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    } catch (error) {
      // If verification fails, allow access to public route
      // User can still access login page
      // Error is intentionally ignored - public routes should be accessible
      if (process.env.NODE_ENV === "development") {
        console.debug("[Middleware] Public route verification skipped:", error);
      }
    }
    
    return NextResponse.next();
  }

  // ============================================================
  // PROTECT ALL ADMIN ROUTES - VERIFICATION REQUIRED
  // ============================================================
  // This includes:
  // - /dashboard/* (all dashboard pages and sub-routes)
  // - /about (if it exists)
  // - ANY other route in the admin panel
  // 
  // EVERY route except public ones MUST verify authentication
  // Call backend to verify CURRENT login status
  // NO TRUST in cookies, localStorage, or cached state
  // ============================================================
  
  try {
    // Extract token from cookie for Bearer auth
    const authToken = request.cookies.get("auth_token");
    const tokenValue = authToken?.value;
    
    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] Verifying auth for:", pathname);
      console.log("[Middleware] Cookie present:", !!authToken);
      console.log("[Middleware] Token value present:", !!tokenValue);
      if (tokenValue) {
        console.log("[Middleware] Token length:", tokenValue.length);
      }
    }

    // Call Next.js API proxy route (which calls backend)
    const verifyUrl = new URL("/api/admin/me", request.url);
    
    // Get all cookies from the request
    const allCookies = request.headers.get("cookie") || "";
    
    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(tokenValue ? { Authorization: `Bearer ${tokenValue}` } : {}),
        Cookie: allCookies,
      },
    });
    
    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] /api/admin/me response status:", response.status);
    }

    // Backend returned 200 = Admin is logged in RIGHT NOW → Allow access
    if (response.ok) {
      return NextResponse.next();
    }

    // Backend returned 401/403 = Admin is NOT logged in → Block access
    // Clear any invalid cookie and redirect to login
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.delete("auth_token");
    
    return redirectResponse;

  } catch (error) {
    // Network error or verification failure = FAIL SECURE
    // Block access and redirect to login
    console.error("[Middleware] Auth verification failed (fail secure):", error);
    
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.delete("auth_token");
    
    return redirectResponse;
  }
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * 🔐 SECURITY: This matcher matches ALL page routes in the admin panel
     * 
     * PROTECTED ROUTES (require backend verification):
     * - /dashboard/* (all dashboard pages and sub-routes)
     * - /dashboard/Profile
     * - /dashboard/CourseLeads
     * - /dashboard/CourseManagement/*
     * - /dashboard/BlogManagement/*
     * - /dashboard/Settings/*
     * - /about (if it exists)
     * - ANY other route in the admin panel
     * 
     * EXCLUDED (not matched by middleware):
     * - /api/* (API routes handle their own auth)
     * - /_next/* (Next.js internal routes)
     * - Static files (images, fonts, etc.)
     * - favicon.ico
     * 
     * PUBLIC ROUTES (handled separately in middleware logic):
     * - / (login page)
     * - /forgot-password
     * 
     * EVERY route matched by this pattern will be verified with backend
     * before allowing access. No exceptions.
     */
    /*
     * Match all routes - exclusions are handled via early returns in middleware
     * Next.js middleware matcher uses simple path patterns
     * We match everything and filter _next/api/static files in the middleware function
     */
    "/:path*",
  ],
};

