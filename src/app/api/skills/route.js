const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET(req) {
  try {
    const incomingAuth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const incomingCookie = req.headers.get("cookie") || "";

    const res = await fetch(BACKEND_URL.replace("/api", "") + "/api/skills", {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
    });

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return new Response(JSON.stringify(data), { status: res.status });
    } catch {
      return new Response(text, { status: res.status });
    }
  } catch (e) {
    console.error("skills GET proxy error:", e);
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const incomingAuth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const incomingCookie = req.headers.get("cookie") || "";

    const getCookieValue = (cookieString, name) => {
      if (!cookieString) return null;
      const parts = cookieString.split(";").map(s => s.trim());
      for (const p of parts) {
        if (p.startsWith(name + "=")) return decodeURIComponent(p.substring(name.length + 1));
      }
      return null;
    };

    const xsrf = getCookieValue(incomingCookie, 'XSRF-TOKEN');

    const headers = {
      "Content-Type": "application/json",
      ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      ...(incomingCookie ? { cookie: incomingCookie } : {}),
      ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
    };

    console.log('skills proxy POST incomingCookie length=', incomingCookie ? incomingCookie.length : 0);
    console.log('skills proxy POST xsrf present=', !!xsrf);

    const res = await fetch(BACKEND_URL.replace("/api", "") + "/api/skills", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log('skills proxy POST backend status=', res.status, 'body preview=', text ? text.substring(0, 1000) : '');
    try {
      const data = JSON.parse(text);
      const responseInit = { status: res.status, headers: {} };
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) responseInit.headers['set-cookie'] = setCookie;
      return new Response(JSON.stringify(data), responseInit);
    } catch {
      return new Response(text, { status: res.status });
    }
  } catch (e) {
    console.error("skills POST proxy error:", e);
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];
    const body = await req.json();
    const incomingAuth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const incomingCookie = req.headers.get("cookie") || "";

    const getCookieValue = (cookieString, name) => {
      if (!cookieString) return null;
      const parts = cookieString.split(";").map(s => s.trim());
      for (const p of parts) {
        if (p.startsWith(name + "=")) return decodeURIComponent(p.substring(name.length + 1));
      }
      return null;
    };

    const xsrf = getCookieValue(incomingCookie, 'XSRF-TOKEN');

    const res = await fetch(BACKEND_URL.replace("/api", "") + `/api/skills/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
        ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
      },
      body: JSON.stringify(body),
    });

  console.log('skills proxy PUT incomingCookie length=', incomingCookie ? incomingCookie.length : 0);
  console.log('skills proxy PUT xsrf present=', !!xsrf);
  const text = await res.text();
  console.log('skills proxy PUT backend status=', res.status, 'body preview=', text ? text.substring(0, 1000) : '');
    try {
      const data = JSON.parse(text);
      return new Response(JSON.stringify(data), { status: res.status });
    } catch {
      return new Response(text, { status: res.status });
    }
  } catch (e) {
    console.error("skills PUT proxy error:", e);
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];
    const incomingAuth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const incomingCookie = req.headers.get("cookie") || "";

    const getCookieValue = (cookieString, name) => {
      if (!cookieString) return null;
      const parts = cookieString.split(";").map(s => s.trim());
      for (const p of parts) {
        if (p.startsWith(name + "=")) return decodeURIComponent(p.substring(name.length + 1));
      }
      return null;
    };

    const xsrf = getCookieValue(incomingCookie, 'XSRF-TOKEN');

    const res = await fetch(BACKEND_URL.replace("/api", "") + `/api/skills/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
        ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
      },
    });

  console.log('skills proxy DELETE incomingCookie length=', incomingCookie ? incomingCookie.length : 0);
  console.log('skills proxy DELETE xsrf present=', !!xsrf);
  const text = await res.text();
  console.log('skills proxy DELETE backend status=', res.status, 'body preview=', text ? text.substring(0, 1000) : '');
    try {
      const data = JSON.parse(text);
      return new Response(JSON.stringify(data), { status: res.status });
    } catch {
      return new Response(text, { status: res.status });
    }
  } catch (e) {
    console.error("skills DELETE proxy error:", e);
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
  }
}
