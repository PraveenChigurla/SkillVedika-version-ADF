const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req) {
  try {
    const incomingCookie = req.headers.get("cookie") || "";

    const target = BACKEND_URL.replace('/api', '') + "/api/admin/logout";
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy admin logout POST] target=', target);
    }

    const res = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
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
    console.error('admin logout POST proxy error', e);
    return new Response(JSON.stringify({ message: 'Failed to contact backend', error: e.message }), { status: 502 });
  }
}

