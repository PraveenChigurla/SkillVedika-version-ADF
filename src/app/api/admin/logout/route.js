const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req) {
  // This log will appear in the Next.js server terminal, not browser console
  console.log('[ROUTE.JS] Logout POST handler called');
  
  try {
    const incomingCookie = req.headers.get("cookie") || "";
    console.log('[ROUTE.JS] Incoming cookie received, length:', incomingCookie.length);

    // Extract auth_token from cookies for Sanctum Bearer token authentication
    let authToken = null;
    if (incomingCookie) {
      const cookies = incomingCookie.split(';').map(c => c.trim());
      const authCookie = cookies.find(c => c.startsWith('auth_token='));
      if (authCookie) {
        // Handle case where token value might contain '=' characters
        const equalIndex = authCookie.indexOf('=');
        if (equalIndex !== -1) {
          authToken = authCookie.substring(equalIndex + 1);
          // URL decode in case the cookie value is encoded
          try {
            authToken = decodeURIComponent(authToken);
          } catch (e) {
            // If decoding fails, use original value
          }
        }
      }
    }


    const target = BACKEND_URL.replace('/api', '') + "/api/admin/logout";
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy admin logout POST] target=', target);
      console.log('[proxy admin logout] authToken extracted:', authToken ? 'YES (length: ' + authToken.length + ')' : 'NO');
      console.log('[proxy admin logout] incomingCookie length:', incomingCookie.length);
    }

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(incomingCookie ? { cookie: incomingCookie } : {}),
    };

    // Add Bearer token to Authorization header for Sanctum
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(target, {
      method: "POST",
      headers,
      credentials: "include",
    });

    // Forward Set-Cookie header to clear the cookie
    const setCookie = res.headers.get("set-cookie");
    const text = await res.text();

    const responseInit = { 
      status: res.status, 
      headers: {
        "Content-Type": "application/json",
      }
    };
    
    // Forward the Set-Cookie header to clear the auth_token cookie
    if (setCookie) {
      responseInit.headers["set-cookie"] = setCookie;
    }

    try {
      if (text && text.length > 0) {
        const data = JSON.parse(text);
        return new Response(JSON.stringify(data), responseInit);
      }
      return new Response(JSON.stringify({ message: "Logged out successfully" }), responseInit);
    } catch {
      return new Response(text || JSON.stringify({ message: "Logged out successfully" }), responseInit);
    }
  } catch (e) {
    console.error('[ROUTE.JS] admin logout POST proxy error', e);
    return new Response(JSON.stringify({ message: 'Failed to contact backend', error: e.message }), { status: 502 });
  }
}

