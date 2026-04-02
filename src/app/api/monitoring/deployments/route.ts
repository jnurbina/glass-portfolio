import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return NextResponse.json(
      { error: 'Vercel API token or project ID not configured' },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Vercel API error:', res.status, errBody);
      return NextResponse.json(
        { error: `Vercel API returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    const deployments = data.deployments.map(
      (d: {
        uid: string;
        name: string;
        state: string;
        url: string;
        created: number;
        meta?: { githubCommitMessage?: string; githubCommitRef?: string };
      }) => ({
        id: d.uid,
        name: d.name,
        state: d.state,
        url: d.url,
        created: d.created,
        commitMessage: d.meta?.githubCommitMessage || null,
        branch: d.meta?.githubCommitRef || null,
      })
    );

    return NextResponse.json({ deployments });
  } catch (error) {
    console.error('Failed to fetch deployments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Vercel deployments' },
      { status: 500 }
    );
  }
}
