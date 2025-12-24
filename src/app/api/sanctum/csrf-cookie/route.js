const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace('/api','');

export async function GET(req) {
  try {
    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const incomingCookie = req.headers.get('cookie') || '';

    const res = await fetch(BACKEND_BASE + '/sanctum/csrf-cookie', {
      method: 'GET',
      headers: {
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
    });

    // forward Set-Cookie headers if backend set them
    const setCookie = res.headers.get('set-cookie');
    console.log('csrf-cookie proxy set-cookie header present=', !!setCookie, 'valuePreview=', setCookie ? setCookie.substring(0,200) : '');
    const text = await res.text();

    const responseInit = { status: res.status, headers: {} };
    if (setCookie) responseInit.headers['set-cookie'] = setCookie;

    // If backend returned 204 No Content, return an empty response with same headers/status
    if (res.status === 204) {
      return new Response(null, responseInit);
    }

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
    console.error('csrf-cookie proxy error:', e);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
}
