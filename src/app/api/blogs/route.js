const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET(req) {
  try {
    const incomingCookie = req.headers.get("cookie") || "";

    const target = BACKEND_URL.replace("/api", "") + "/api/blogs";
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy blogs GET] target=', target, 'incomingCookie length=', incomingCookie.length, 'xsrf_present=', incomingCookie.includes('XSRF-TOKEN'));
    }

    const res = await fetch(target, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
    });
    const text = await res.text();
    try { 
      return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); 
    } catch { 
      return new Response(text, { status: res.status }); 
    }
  } catch (e) {
    console.error('blogs GET proxy error (target=' + (typeof target !== 'undefined' ? target : BACKEND_URL) + ')', e);
    const errMessage = e && e.message ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      message: 'Failed to contact backend', 
      backend: (typeof target !== 'undefined' ? target : BACKEND_URL), 
      error: errMessage 
    }), { status: 502 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const incomingCookie = req.headers.get("cookie") || "";
    const res = await fetch(BACKEND_URL.replace("/api", "") + "/api/blogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try { 
      return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); 
    } catch { 
      return new Response(text, { status: res.status }); 
    }
  } catch (e) {
    const target = BACKEND_URL.replace("/api", "") + "/api/blogs";
    console.error('blogs POST proxy error (target=' + target + ')', e);
    const errMessage = e && e.message ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      message: 'Failed to contact backend', 
      backend: target, 
      error: errMessage 
    }), { status: 502 });
  }
}
