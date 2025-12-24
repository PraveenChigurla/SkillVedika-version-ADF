const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(BACKEND_URL.replace("/api", "") + "/api/live-demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (e) {
    console.error("POST /api/live-demo error:", e);
    return new Response(JSON.stringify({ message: "Server Error", error: e.message }), {
      status: 500,
    });
  }
}

export async function GET(req) {
  try {
    const response = await fetch(BACKEND_URL.replace("/api", "") + "/api/live-demo", {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (e) {
    console.error("GET /api/live-demo error:", e);
    return new Response(JSON.stringify({ message: "Server Error", error: e.message }), {
      status: 500,
    });
  }
}
