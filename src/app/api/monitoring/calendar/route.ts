import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

interface CalEvent {
  start: string;
  end: string;
  title: string;
  location?: string;
}

export async function GET() {
  try {
    // gcalcli agenda for next 7 days in TSV format
    const { stdout } = await execAsync(
      'gcalcli agenda --nocolor --tsv --details=location "now" "7 days from now"',
      { timeout: 10000 }
    );

    if (!stdout.trim()) {
      return NextResponse.json({ events: [], message: 'No upcoming events' });
    }

    const lines = stdout.trim().split('\n');
    const events: CalEvent[] = [];

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 4) {
        const [startDate, startTime, endDate, endTime, ...rest] = parts;
        const title = rest[0] || 'Untitled';
        const location = rest[1] || undefined;

        events.push({
          start: `${startDate} ${startTime}`.trim(),
          end: `${endDate} ${endTime}`.trim(),
          title,
          location,
        });
      }
    }

    return NextResponse.json({ events });
  } catch (error: any) {
    // gcalcli not available (expected on Vercel)
    if (
      error.message?.includes('not found') ||
      error.message?.includes('ENOENT') ||
      error.code === 127
    ) {
      return NextResponse.json(
        { error: 'gcalcli not available', hint: 'Calendar requires local environment' },
        { status: 503 }
      );
    }

    console.error('Calendar fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}
