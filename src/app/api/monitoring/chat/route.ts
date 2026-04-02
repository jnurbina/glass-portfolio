import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:55378';

// GET: Fetch recent messages from the main session
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '20';

  try {
    const res = await fetch(
      `${GATEWAY_URL}/api/sessions/main/messages?limit=${limit}`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3000),
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Gateway returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        error: 'Gateway unreachable',
        hint: 'Chat requires local gateway access',
      },
      { status: 503 }
    );
  }
}

// POST: Send a message to the main session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const res = await fetch(`${GATEWAY_URL}/api/sessions/main/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Gateway returned ${res.status}: ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        error: 'Gateway unreachable',
        hint: 'Chat requires local gateway access',
      },
      { status: 503 }
    );
  }
}
