'use client';

import { useEffect, useState } from 'react';
import { useAction } from 'convex/react';
import PeriodicTableCard from './PeriodicTableCard';
import { Clock, MapPin, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../../convex/_generated/api';

interface CalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string | null;
  allDay?: boolean;
}

const formatEventTime = (dateStr: string, allDay?: boolean) => {
  try {
    if (allDay) {
      const d = new Date(dateStr + 'T00:00:00');
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
      if (isToday) return 'Today (all day)';
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow =
        d.getDate() === tomorrow.getDate() &&
        d.getMonth() === tomorrow.getMonth() &&
        d.getFullYear() === tomorrow.getFullYear();
      if (isTomorrow) return 'Tomorrow (all day)';
      return (
        d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }) + ' (all day)'
      );
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      d.getDate() === tomorrow.getDate() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getFullYear() === tomorrow.getFullYear();

    const time = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) return `Today ${time}`;
    if (isTomorrow) return `Tomorrow ${time}`;
    return (
      d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }) + ` ${time}`
    );
  } catch {
    return dateStr;
  }
};

export function CalendarPanel() {
  const fetchEvents = useAction(api.calendar.events);
  const [events, setEvents] = useState<CalEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await fetchEvents({});
        if (!cancelled) {
          setEvents(result.events);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Calendar error');
        }
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [fetchEvents]);

  const list: CalEvent[] = events ?? [];
  const now = new Date();
  const monthStr = now
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase();

  return (
    <PeriodicTableCard
      symbol="Ca"
      name="Calendar"
      metric={
        error
          ? '!'
          : list.length > 0
            ? `${list.length}`
            : monthStr
      }
    >
      <div className="space-y-2">
        {error ? (
          <div className="flex items-center space-x-1 text-xs">
            <AlertCircle size={12} className="text-destructive" />
            <span className="text-destructive">Calendar unavailable</span>
          </div>
        ) : events === null ? (
          <div className="flex items-center space-x-1 text-xs">
            <Loader2
              size={12}
              className="animate-spin text-muted-foreground"
            />
            <span className="text-muted-foreground">Loading events...</span>
          </div>
        ) : list.length === 0 ? (
          <div className="flex items-center space-x-1 text-xs">
            <Calendar size={12} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              No upcoming events this week
            </span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[160px] overflow-y-auto">
            {list.slice(0, 8).map((evt) => (
              <div key={evt.id} className="space-y-0.5">
                <div className="flex items-start space-x-2 text-xs">
                  <Clock
                    size={12}
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {evt.title}
                    </div>
                    <div className="text-muted-foreground">
                      {formatEventTime(evt.start, evt.allDay)}
                    </div>
                    {evt.location && (
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PeriodicTableCard>
  );
}
