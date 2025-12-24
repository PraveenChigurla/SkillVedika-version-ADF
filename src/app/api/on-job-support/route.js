// export async function GET(req) {
//   try {
//     // Forward to Laravel backend
//     const res = await fetch("http://localhost:8000/api/on-job-support", {
//       method: "GET",
//       headers: { Accept: "application/json" },
//     });

//     const text = await res.text();
//     let data;

//     try { data = JSON.parse(text); }
//     catch { data = { message: text }; }

//     return new Response(JSON.stringify(data), {
//       status: res.status,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("API GET ERROR:", error);
//     return new Response(JSON.stringify({ message: "API Route crashed" }), {
//       status: 500,
//     });
//   }
// }

// export async function POST(req) {
//   try {
//     const body = await req.json();

//     // Forward to Laravel backend
//     const res = await fetch("http://localhost:8000/api/on-job-support", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });

//     const text = await res.text();
//     let data;

//     try { data = JSON.parse(text); }
//     catch { data = { message: text }; }

//     return new Response(JSON.stringify(data), {
//       status: res.status,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("API ERROR:", error);
//     return new Response(JSON.stringify({ message: "API Route crashed" }), {
//       status: 500,
//     });
//   }
// }

import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // base URL, will append /api below

async function parseResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    // Backend returned HTML or plain text (e.g., error page) — wrap it
    console.error("parseResponse JSON.parse error:", err);
    return { message: text };
  }
}

export async function GET() {
  try {
    const backendUrl = `${API_URL.replace(/\/$/, '')}/api/on-job-support`;
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const data = await parseResponse(res);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("GET /api/on-job-support proxy error:", error);
    return NextResponse.json(
      { message: "API Route crashed" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const backendUrl = `${API_URL.replace(/\/$/, '')}/api/on-job-support`;
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await parseResponse(res);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("POST /api/on-job-support proxy error:", error);
    return NextResponse.json(
      { message: "API Route crashed" },
      { status: 500 }
    );
  }
}
