const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET(req) {
  try {
    const incomingAuth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const incomingCookie = req.headers.get("cookie") || "";

    const res = await fetch(BACKEND_URL.replace("/api", "") + "/api/popular-tags", {
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
    console.error("public/popular-tags GET proxy error:", e);
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const incomingAuth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const incomingCookie = req.headers.get("cookie") || "";

    const res = await fetch(BACKEND_URL.replace("/api", "") + "/api/public/popular-tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return new Response(JSON.stringify(data), { status: res.status });
    } catch {
      return new Response(text, { status: res.status });
    }
  } catch (e) {
    console.error("public/popular-tags POST proxy error:", e);
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

    const res = await fetch(BACKEND_URL.replace("/api", "") + `/api/public/popular-tags/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return new Response(JSON.stringify(data), { status: res.status });
    } catch {
      return new Response(text, { status: res.status });
    }
  } catch (e) {
    console.error("public/popular-tags PUT proxy error:", e);
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

    const res = await fetch(BACKEND_URL.replace("/api", "") + `/api/public/popular-tags/${id}`, {
      method: "DELETE",
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
    console.error("public/popular-tags DELETE proxy error:", e);
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
  }
}
