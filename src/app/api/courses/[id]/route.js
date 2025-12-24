const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    console.log('[proxy courses GET by id] id=', id, 'incomingCookie length=', incomingCookie.length, 'xsrf_present=', incomingCookie.includes('XSRF-TOKEN'), 'authPreview=', incomingAuth ? incomingAuth.substring(0,20) : '');
    const res = await fetch(BACKEND_URL.replace('/api', '') + `/api/courses/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      },
    });
    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('courses GET by id proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];
    const body = await req.json();
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    console.log('[proxy courses PUT] id=', id, 'incomingCookie length=', incomingCookie.length, 'xsrf_present=', incomingCookie.includes('XSRF-TOKEN'), 'authPreview=', incomingAuth ? incomingAuth.substring(0,20) : '', 'bodyPreview=', JSON.stringify(body).substring(0,200));
    const res = await fetch(BACKEND_URL.replace('/api', '') + `/api/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('courses PUT proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];
    const incomingCookie = req.headers.get('cookie') || '';
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    console.log('[proxy courses DELETE] id=', id, 'incomingCookie length=', incomingCookie.length, 'xsrf_present=', incomingCookie.includes('XSRF-TOKEN'), 'authPreview=', incomingAuth ? incomingAuth.substring(0,20) : '');
    const res = await fetch(BACKEND_URL.replace('/api', '') + `/api/courses/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      },
    });
    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('courses DELETE proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}
