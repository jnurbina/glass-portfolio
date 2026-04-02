import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface CalendarEvent {
  id: string;
  summary?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  status?: string;
}

// Refresh the access token using the refresh token
async function getAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Calendar credentials not configured');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
  }

  const data: TokenResponse = await res.json();
  return data.access_token;
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const now = new Date().toISOString();
    const weekFromNow = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const params = new URLSearchParams({
      timeMin: now,
      timeMax: weekFromNow,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '15',
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Google Calendar API error:', res.status, err);
      return NextResponse.json(
        { error: `Google Calendar API returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    const events = (data.items || [])
      .filter((e: CalendarEvent) => e.status !== 'cancelled')
      .map((e: CalendarEvent) => ({
        id: e.id,
        title: e.summary || 'Untitled',
        start: e.start.dateTime || e.start.date || '',
        end: e.end.dateTime || e.end.date || '',
        location: e.location || null,
        allDay: !e.start.dateTime,
      }));

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Calendar fetch error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch calendar' },
      { status: 500 }
    );
  }
}
