const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET(req) {
  try {
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const target = BACKEND_URL.replace('/api', '') + "/api/admin/profile";
    if (process.env.NODE_ENV !== 'production') console.log('[proxy admin profile GET] target=', target, 'incomingCookie length=', incomingCookie.length);

    const res = await fetch(target, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
    });

    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('admin profile GET proxy error (target=' + (typeof target !== 'undefined' ? target : BACKEND_URL) + ')', e);
    const errMessage = e && e.message ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ message: 'Failed to contact backend', backend: (typeof target !== 'undefined' ? target : BACKEND_URL), error: errMessage }), { status: 502 });
  }
}
