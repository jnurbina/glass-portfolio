import { NextResponse } from "next/server";
import { OpenclawConfigError, openclawFetch } from "@/lib/openclaw";

export const dynamic = "force-dynamic";

// GET: Fetch recent messages from the main session.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "20";

  try {
    const res = await openclawFetch(
      `/api/sessions/main/messages?limit=${encodeURIComponent(limit)}`,
      { timeoutMs: 3000 },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Gateway returned ${res.status}` },
        { status: res.status },
      );
    }
    return NextResponse.json(await res.json());
  } catch (error) {
    if (error instanceof OpenclawConfigError) {
      return NextResponse.json(
        { error: "Gateway not configured", hint: error.message },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Gateway unreachable", hint: "Chat requires reachable OpenClaw gateway" },
      { status: 503 },
    );
  }
}

// POST: Send a message to the main session.
export async function POST(request: Request) {
  let body: { message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message : null;
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const res = await openclawFetch("/api/sessions/main/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      timeoutMs: 5000,
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Gateway returned ${res.status}: ${errText}` },
        { status: res.status },
      );
    }
    return NextResponse.json(await res.json());
  } catch (error) {
    if (error instanceof OpenclawConfigError) {
      return NextResponse.json(
        { error: "Gateway not configured", hint: error.message },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Gateway unreachable", hint: "Chat requires reachable OpenClaw gateway" },
      { status: 503 },
    );
  }
}
