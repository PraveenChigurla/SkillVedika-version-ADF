const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Proxy route for /api/admin/me
 * This endpoint is called by middleware to verify authentication status
 * NEVER caches results - always forwards to backend for fresh verification
 */
export async function GET(req) {
  try {
    const incomingCookie = req.headers.get("cookie") || "";
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy admin/me GET] incomingCookie length:', incomingCookie.length);
      console.log('[proxy admin/me GET] incomingCookie preview:', incomingCookie.substring(0, 200));
    }
    
    // Extract auth_token from cookie for Bearer token authentication
    let authToken = null;
    if (incomingCookie) {
      const cookies = incomingCookie.split(';').map(c => c.trim());
      const authCookie = cookies.find(c => c.startsWith('auth_token='));
      if (authCookie) {
        const equalIndex = authCookie.indexOf('=');
        if (equalIndex !== -1) {
          authToken = authCookie.substring(equalIndex + 1);
          try {
            authToken = decodeURIComponent(authToken);
          } catch (e) {
            // If decoding fails, use original value
          }
        }
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy admin/me GET] authToken extracted:', authToken ? 'YES (length: ' + authToken.length + ')' : 'NO');
    }

    const target = BACKEND_URL.replace('/api', '') + "/api/admin/me";

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(incomingCookie ? { cookie: incomingCookie } : {}),
    };

    // For Laravel Sanctum with cookies, we need BOTH:
    // 1. The cookie (for stateful authentication)
    // 2. The Bearer token in Authorization header (Sanctum checks this first, then falls back to cookie)
    // The token from the cookie IS the plain text token, so we can use it as Bearer
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
      if (process.env.NODE_ENV !== 'production') {
        console.log('[proxy admin/me GET] Authorization header set, token preview:', authToken.substring(0, 50) + '...');
        console.log('[proxy admin/me GET] Full token length:', authToken.length);
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[proxy admin/me GET] WARNING: No authToken to send!');
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy admin/me GET] Calling backend:', target);
      console.log('[proxy admin/me GET] Headers:', JSON.stringify(Object.keys(headers)));
    }

    const res = await fetch(target, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy admin/me GET] Backend response status:', res.status);
      if (res.status !== 200) {
        const errorText = await res.clone().text();
        console.log('[proxy admin/me GET] Backend error response:', errorText.substring(0, 200));
      }
    }

    const text = await res.text();

    // Forward exact status and response from backend
    // NO caching, NO modification - backend is source of truth
    try {
      if (text && text.length > 0) {
        const data = JSON.parse(text);
        return new Response(JSON.stringify(data), { 
          status: res.status,
          headers: {
            "Content-Type": "application/json",
          }
        });
      }
      return new Response(null, { status: res.status });
    } catch {
      return new Response(text || null, { status: res.status });
    }
  } catch (e) {
    // Network error = treat as unauthenticated (fail secure)
    console.error('[proxy admin/me GET] error', e);
    return new Response(JSON.stringify({ logged_in: false, message: 'Verification failed' }), { status: 401 });
  }
}

