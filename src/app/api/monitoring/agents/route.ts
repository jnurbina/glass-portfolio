import { NextResponse } from "next/server";
import { OpenclawConfigError, openclawFetch } from "@/lib/openclaw";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await openclawFetch("/api/sessions", { timeoutMs: 3000 });

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
      {
        error: "Gateway unreachable",
        hint: "Agent status requires reachable OpenClaw gateway",
      },
      { status: 503 },
    );
  }
}
