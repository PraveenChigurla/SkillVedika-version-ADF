const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req) {
  try {
    const body = await req.json();

    const incomingCookie = req.headers.get("cookie") || "";

    const res = await fetch(BACKEND_URL.replace("/api", "") + "/api/admin/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
      credentials: "include", // Important for cookies
      body: JSON.stringify(body),
    });

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return new Response(JSON.stringify(data), { status: res.status });
    } catch (e) {
      return new Response(text, { status: res.status });
    }
  } catch (e) {
    console.error("forgot-password proxy error:", e);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
