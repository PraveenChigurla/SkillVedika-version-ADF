const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const search = url.search || "";
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    console.log('[proxy course-details GET] search=', search, 'incomingCookie length=', incomingCookie.length, 'xsrf_present=', incomingCookie.includes('XSRF-TOKEN'), 'authPreview=', incomingAuth ? incomingAuth.substring(0,20) : '');
    const res = await fetch(BACKEND_URL.replace('/api', '') + "/api/course-details" + search, {
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
    console.error('course-details GET proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    console.log('[proxy course-details POST] incomingCookie length=', incomingCookie.length, 'xsrf_present=', incomingCookie.includes('XSRF-TOKEN'), 'authPreview=', incomingAuth ? incomingAuth.substring(0,20) : '', 'bodyPreview=', JSON.stringify(body).substring(0,200));
    const res = await fetch(BACKEND_URL.replace('/api', '') + "/api/course-details", {
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
    console.error('course-details POST proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}
