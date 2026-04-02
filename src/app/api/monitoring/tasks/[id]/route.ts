import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

async function convexMutation(functionPath: string, args: Record<string, unknown> = {}) {
  if (!CONVEX_URL) throw new Error('Convex not configured');
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: functionPath, args }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Convex mutation failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.value;
}

// PATCH: Toggle task done status
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await convexMutation('tasks:toggle', { id });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Task toggle error:', error.message);
    return NextResponse.json(
      { error: 'Failed to toggle task', detail: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a task
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await convexMutation('tasks:remove', { id });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Task delete error:', error.message);
    return NextResponse.json(
      { error: 'Failed to delete task', detail: error.message },
      { status: 500 }
    );
  }
}
