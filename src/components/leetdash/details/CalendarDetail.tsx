'use client';

import { useEffect, useState } from 'react';
import { useAction } from 'convex/react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';

interface CalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string | null;
  allDay?: boolean;
}

const fmtTime = (iso: string, allDay?: boolean) => {
  try {
    const d = allDay ? new Date(iso + 'T00:00:00') : new Date(iso);
    if (isNaN(d.getTime())) return iso;
    if (allDay) {
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
    return (
      d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }) +
      ' · ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    );
  } catch {
    return iso;
  }
};

const dayBucket = (iso: string) => {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'unknown';
    return d.toDateString();
  } catch {
    return 'unknown';
  }
};

export function CalendarDetail() {
  const fetchEvents = useAction(api.calendar.events);
  const [events, setEvents] = useState<CalEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetchEvents({});
        if (!cancelled) setEvents(r.events as CalEvent[]);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Calendar error');
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [fetchEvents]);

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error.replace(/^.*?\}\s*/, '')}
      </p>
    );
  }
  if (!events) {
    return <p className="text-sm text-muted-foreground">Loading events…</p>;
  }
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing on the calendar this week.
      </p>
    );
  }

  // Group by day for visual rhythm.
  const groups = new Map<string, CalEvent[]>();
  for (const e of events) {
    const k = dayBucket(e.start);
    const arr = groups.get(k) ?? [];
    arr.push(e);
    groups.set(k, arr);
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([day, items], gi) => (
        <motion.div
          key={day}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.04 }}
          className="space-y-2"
        >
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
            {new Date(day).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </h3>
          <ul className="space-y-2">
            {items.map((e) => (
              <li
                key={e.id}
                className="flex items-start gap-3 rounded-lg border border-border/30 bg-muted/5 p-3"
              >
                <div className="mt-0.5 shrink-0">
                  {e.allDay ? (
                    <Calendar size={14} className="text-sky-400" />
                  ) : (
                    <Clock size={14} className="text-sky-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {e.title}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground/80">
                    {fmtTime(e.start, e.allDay)}
                  </div>
                  {e.location && (
                    <div className="mt-1 flex items-center gap-1 font-mono text-[11px] text-muted-foreground/60">
                      <MapPin size={10} />
                      <span className="truncate">{e.location}</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
