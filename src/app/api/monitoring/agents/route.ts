import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:55378';

  try {
    const res = await fetch(`${gatewayUrl}/api/sessions`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Gateway returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    // Gateway unreachable (expected on Vercel deployment)
    return NextResponse.json(
      {
        error: 'Gateway unreachable',
        hint: 'Agent status requires local gateway access',
      },
      { status: 503 }
    );
  }
}
