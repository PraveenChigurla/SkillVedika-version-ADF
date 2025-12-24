const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET(req) {
  try {
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy footer-settings GET] incomingCookie length=', incomingCookie.length, 'authPreview=', incomingAuth ? incomingAuth.substring(0,20) : '');
    }
    const res = await fetch(BACKEND_URL.replace('/api', '') + "/api/footer-settings", {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      },
    });
    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('footer-settings GET proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy footer-settings POST] incomingCookie length=', incomingCookie.length, 'authPreview=', incomingAuth ? incomingAuth.substring(0,20) : '');
    }
    const res = await fetch(BACKEND_URL.replace('/api', '') + "/api/footer-settings", {
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
    console.error('footer-settings POST proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy footer-settings PUT] incomingCookie length=', incomingCookie.length, 'authPreview=', incomingAuth ? incomingAuth.substring(0,20) : '');
    }
    const res = await fetch(BACKEND_URL.replace('/api', '') + "/api/footer-settings", {
      method: "PUT",
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
    console.error('footer-settings PUT proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}
