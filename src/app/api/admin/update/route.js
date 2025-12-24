const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req) {
  try {
    const body = await req.json();
    const incomingCookie = req.headers.get("cookie") || "";
    const target = BACKEND_URL.replace('/api', '') + "/api/admin/update";
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy admin update POST] target=', target, 'incomingCookie length=', incomingCookie.length, 'bodyPreview=', JSON.stringify(body).substring(0,200));
    }

    const res = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
      credentials: "include", // Important for cookies
      body: JSON.stringify(body),
    });

    // Forward Set-Cookie header if present (backend may update token cookie)
    const setCookie = res.headers.get("set-cookie");
    const text = await res.text();
    
    const responseInit = {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      }
    };
    
    if (setCookie) {
      responseInit.headers["set-cookie"] = setCookie;
    }

    try {
      return new Response(JSON.stringify(JSON.parse(text)), responseInit);
    } catch {
      return new Response(text, responseInit);
    }
  } catch (e) {
    console.error('admin update POST proxy error (target=' + (typeof target !== 'undefined' ? target : BACKEND_URL) + ')', e);
    const errMessage = e && e.message ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ message: 'Failed to contact backend', backend: (typeof target !== 'undefined' ? target : BACKEND_URL), error: errMessage }), { status: 502 });
  }
}
