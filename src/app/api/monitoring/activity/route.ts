import { NextResponse } from "next/server";
import { OpenclawConfigError, openclawFetch } from "@/lib/openclaw";

export const dynamic = "force-dynamic";

/**
 * Proxy to the OpenClaw gateway's /api/activity endpoint (provided by the
 * leetdash plugin). Returns the most recent agent-lifecycle activities.
 *
 * Query params:
 *   limit  number  (1..bufferLimit). Defaults to whatever the gateway picks.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");
  const path = limit
    ? `/api/activity?limit=${encodeURIComponent(limit)}`
    : "/api/activity";

  try {
    const res = await openclawFetch(path, { timeoutMs: 5000 });

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
      { error: "Gateway unreachable", hint: "Activity feed requires reachable OpenClaw gateway" },
      { status: 503 },
    );
  }
}
