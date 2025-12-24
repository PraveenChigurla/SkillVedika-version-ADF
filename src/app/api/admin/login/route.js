const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req) {

	try {
		const body = await req.json();
		const incomingCookie = req.headers.get("cookie") || "";
		const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';

		const target = BACKEND_URL.replace('/api', '') + "/api/admin/login";
		if (process.env.NODE_ENV !== 'production') {
			console.log('[proxy admin login POST] target=', target, 'incomingCookie length=', incomingCookie.length, 'authPreview=', incomingAuth ? incomingAuth.substring(0,20) : '', 'bodyPreview=', JSON.stringify(body).substring(0,200));
		}

		const res = await fetch(target, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				...(incomingCookie ? { cookie: incomingCookie } : {}),
				...(incomingAuth ? { Authorization: incomingAuth } : {}),
			},
			body: JSON.stringify(body),
		});

		const text = await res.text();
		try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
	} catch (e) {
		console.error('admin login POST proxy error (target=' + (typeof target !== 'undefined' ? target : BACKEND_URL) + ')', e);
		const errMessage = e && e.message ? e.message : 'Unknown error';
		return new Response(JSON.stringify({ message: 'Failed to contact backend', backend: (typeof target !== 'undefined' ? target : BACKEND_URL), error: errMessage }), { status: 502 });
	}
}

export async function GET(req) {
	// Optional: proxy for GET if needed
	try {
		const incomingCookie = req.headers.get("cookie") || "";
		const target = BACKEND_URL.replace('/api', '') + "/api/admin/login";
		if (process.env.NODE_ENV !== 'production') console.log('[proxy admin login GET] target=', target);
		const res = await fetch(target, { method: 'GET', headers: { Accept: 'application/json', ...(incomingCookie ? { cookie: incomingCookie } : {}) } });
		const text = await res.text();
		try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
	} catch (e) {
		console.error('admin login GET proxy error', e);
		return new Response(JSON.stringify({ message: 'Failed to contact backend' }), { status: 502 });
	}

  try {
    const body = await req.json();

    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get("authorization") || req.headers.get("Authorization") || "";

    const res = await fetch(BACKEND_URL.replace("/api", "") + "/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const setCookie = res.headers.get("set-cookie");
    const text = await res.text();

    const responseInit = { status: res.status, headers: {} };
    if (setCookie) responseInit.headers["set-cookie"] = setCookie;

    try {
      if (text && text.length > 0) {
        const data = JSON.parse(text);
        return new Response(JSON.stringify(data), responseInit);
      }
      return new Response(null, responseInit);
    } catch {
      return new Response(text || null, responseInit);
    }
  } catch (e) {
    console.error("login proxy error:", e);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }

}
