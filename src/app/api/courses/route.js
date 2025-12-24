const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const search = url.search || "";
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    if (process.env.NODE_ENV !== 'production') {
      const logParts = ['[proxy courses GET]'];
      if (search) logParts.push(`search=${search}`);
      logParts.push(`cookieLen=${incomingCookie.length}`, `xsrf=${incomingCookie.includes('XSRF-TOKEN')}`);
      if (incomingAuth) logParts.push(`auth=${incomingAuth.substring(0,20)}`);
      console.log(logParts.join(' '));
    }
    const res = await fetch(BACKEND_URL.replace('/api', '') + "/api/courses" + search, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      },
    });
    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status, headers: { "Content-Type": "application/json" } }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('courses GET proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    if (process.env.NODE_ENV !== 'production') {
      const logParts = ['[proxy courses POST]'];
      logParts.push(`cookieLen=${incomingCookie.length}`, `xsrf=${incomingCookie.includes('XSRF-TOKEN')}`);
      if (incomingAuth) logParts.push(`auth=${incomingAuth.substring(0,20)}`);
      if (body) logParts.push(`body=${JSON.stringify(body).substring(0,200)}`);
      console.log(logParts.join(' '));
    }
    const res = await fetch(BACKEND_URL.replace('/api', '') + "/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status, headers: { "Content-Type": "application/json" } }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('courses POST proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
