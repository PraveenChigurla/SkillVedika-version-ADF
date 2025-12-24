import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL; // http://localhost:8000/api

// GET ABOUT PAGE
export async function GET() {
  try {
    const res = await fetch(`${API}/about-page`);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "GET failed", error: err.message },
      { status: 500 }
    );
  }
}

// SAVE ABOUT PAGE
export async function POST(req) {
  try {
    const body = await req.json();

    const res = await fetch(`${API}/about-page`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "POST failed", error: err.message },
      { status: 500 }
    );
  }
}
