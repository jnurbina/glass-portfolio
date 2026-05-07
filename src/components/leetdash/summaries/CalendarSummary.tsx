'use client';

import { useEffect, useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

interface CalEvent {
  id: string;
  title: string;
  start: string;
  allDay?: boolean;
}

const compactWhen = (start: string, allDay?: boolean) => {
  try {
    const d = allDay ? new Date(start + 'T00:00:00') : new Date(start);
    if (isNaN(d.getTime())) return start;
    const now = new Date();
    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (sameDay && !allDay) {
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    if (sameDay) return 'today';
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  } catch {
    return start;
  }
};

export function CalendarSummary() {
  const fetchEvents = useAction(api.calendar.events);
  const [events, setEvents] = useState<CalEvent[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchEvents({})
      .then((r) => {
        if (!cancelled) {
          setEvents(r.events as CalEvent[]);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchEvents]);

  if (error) return <Hint>Unavailable.</Hint>;
  if (!events) return <SkeletonRows />;
  if (events.length === 0) return <Hint>Nothing this week.</Hint>;

  return (
    <ul className="space-y-1.5 text-[11px]">
      {events.slice(0, 3).map((e) => (
        <li key={e.id} className="flex items-baseline gap-2">
          <span className="w-12 shrink-0 font-mono text-muted-foreground/70">
            {compactWhen(e.start, e.allDay)}
          </span>
          <span className="truncate text-foreground/90">{e.title}</span>
        </li>
      ))}
    </ul>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-1.5">
      <div className="h-3 w-full animate-pulse rounded bg-muted/30" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-muted/30" />
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-muted-foreground/70">{children}</p>;
}
