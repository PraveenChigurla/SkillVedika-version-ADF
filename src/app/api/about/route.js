const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function parseResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    // backend returned HTML or plain text (e.g. error page) — wrap it so frontend can handle
    console.error("parseResponse JSON.parse error:", err);
    return { message: text };
  }
}

export async function GET() {
  try {
    const res = await fetch(
      `${BACKEND_URL.replace(/\/$/, "")}/api/about-page`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    const data = await parseResponse(res);
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/about proxy error:", error);
    return new Response(
      JSON.stringify({ message: "API Route crashed", error: String(error) }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const res = await fetch(
      `${BACKEND_URL.replace(/\/$/, "")}/api/about-page`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await parseResponse(res);
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/about proxy error:", error);
    return new Response(
      JSON.stringify({ message: "API Route crashed", error: String(error) }),
      { status: 500 }
    );
  }
}
