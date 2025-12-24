const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET(req) {
  try {
    const incomingCookie = req.headers.get("cookie") || "";
    const res = await fetch(BACKEND_URL.replace("/api", "") + "/api/blog-categories", {
      method: "GET",
      headers: {
        Accept: "application/json",
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
    console.error("blog-categories GET proxy error:", e);
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
  }
}
