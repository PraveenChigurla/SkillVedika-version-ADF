const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req) {
  try {
    const body = await req.json();

    // Forward incoming cookies and Authorization header so backend can authenticate
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth =
      req.headers.get("authorization") ||
      req.headers.get("Authorization") ||
      "";

    const res = await fetch(
      BACKEND_URL.replace("/api", "") + "/api/terms-and-conditions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(incomingAuth ? { Authorization: incomingAuth } : {}),
          ...(incomingCookie ? { cookie: incomingCookie } : {}),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (e) {
    console.error("POST error:", e);
    return new Response(JSON.stringify({ message: "Server Error" }), {
      status: 500,
    });
  }
}

export async function GET(req) {
  try {
    // Forward cookies/authorization so the backend receives the user's session
    const incomingCookie = req.headers.get("cookie") || "";
    const incomingAuth =
      req.headers.get("authorization") ||
      req.headers.get("Authorization") ||
      "";

    const res = await fetch(
      BACKEND_URL.replace("/api", "") + "/api/terms-and-conditions",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(incomingAuth ? { Authorization: incomingAuth } : {}),
          ...(incomingCookie ? { cookie: incomingCookie } : {}),
        },
      }
    );

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (e) {
    console.error("GET error:", e);
    return new Response(JSON.stringify({ message: "Server Error" }), {
      status: 500,
    });
  }
}
