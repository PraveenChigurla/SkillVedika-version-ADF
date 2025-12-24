const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function PUT(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];
    const body = await req.json();
    const incomingCookie = req.headers.get("cookie") || "";
    const res = await fetch(BACKEND_URL.replace('/api', '') + `/api/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('blogs PUT proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];
    const incomingCookie = req.headers.get("cookie") || "";
    const res = await fetch(BACKEND_URL.replace('/api', '') + `/api/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
    });
    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('blogs DELETE proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];
    const incomingCookie = req.headers.get("cookie") || "";
    const res = await fetch(BACKEND_URL.replace('/api', '') + `/api/blogs/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
    });
    const text = await res.text();
    try { return new Response(JSON.stringify(JSON.parse(text)), { status: res.status }); } catch { return new Response(text, { status: res.status }); }
  } catch (e) {
    console.error('blogs GET by id proxy error', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}
