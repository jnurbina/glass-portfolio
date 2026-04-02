import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

async function convexQuery(functionPath: string, args: Record<string, unknown> = {}) {
  if (!CONVEX_URL) throw new Error('Convex not configured');
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: functionPath, args }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Convex query failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.value;
}

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

// GET: List all tasks
export async function GET() {
  try {
    const tasks = await convexQuery('tasks:list');
    return NextResponse.json({ tasks: tasks || [] });
  } catch (error: any) {
    console.error('Tasks fetch error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', detail: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new task
export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const id = await convexMutation('tasks:create', { title });
    return NextResponse.json({ id });
  } catch (error: any) {
    console.error('Task create error:', error.message);
    return NextResponse.json(
      { error: 'Failed to create task', detail: error.message },
      { status: 500 }
    );
  }
}
