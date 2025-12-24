const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get("authorization") || req.headers.get("Authorization") || "";

    const getCookieValue = (cookieString, name) => {
      if (!cookieString) return null;
      const parts = cookieString.split(";").map(s => s.trim());
      for (const p of parts) {
        if (p.startsWith(name + "=")) return decodeURIComponent(p.substring(name.length + 1));
      }
      return null;
    };

    const xsrf = getCookieValue(incomingCookie, 'XSRF-TOKEN');

    const target = BACKEND_URL.replace("/api", "") + `/api/homepage/${id}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy homepage PUT] target=', target, 'id=', id, 'incomingCookie length=', incomingCookie.length, 'xsrf_present=', !!xsrf);
    }

    const headers = {
      "Content-Type": "application/json",
      ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      ...(incomingCookie ? { cookie: incomingCookie } : {}),
      ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
    };

    const res = await fetch(target, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const text = await res.text();
    const responseInit = { status: res.status, headers: {} };
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) responseInit.headers['set-cookie'] = setCookie;

    try {
      return new Response(JSON.stringify(JSON.parse(text)), responseInit);
    } catch {
      return new Response(text, responseInit);
    }
  } catch (e) {
    console.error('homepage PUT proxy error', e);
    const errMessage = e && e.message ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ message: 'Failed to contact backend', error: errMessage }), { status: 502 });
  }
}

