const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET(req) {
  try {
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    
    // GET requests for pagination/filters don't need CSRF/XSRF - only send auth token
    const res = await fetch(BACKEND_URL.replace('/api', '') + "/api/leads", {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
        // Explicitly exclude cookies for GET requests to avoid any CSRF checks
      },
    });
    console.log('test response', res);

    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('leads GET proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    console.log('leads POST proxy body', body);
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy leads POST] incomingCookie length=', incomingCookie.length, 'xsrf_present=', incomingCookie.includes('XSRF-TOKEN'), 'authPreview=', incomingAuth ? incomingAuth.substring(0,20) : '', 'bodyPreview=', JSON.stringify(body).substring(0,200));
    }

    const res = await fetch(BACKEND_URL.replace('/api', '') + "/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('leads POST proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}
