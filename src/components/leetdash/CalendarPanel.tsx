'use client';

import useSWR from 'swr';
import PeriodicTableCard from './PeriodicTableCard';
import {
  Calendar,
  Clock,
  MapPin,
  WifiOff,
  Loader2,
} from 'lucide-react';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });

interface CalEvent {
  start: string;
  end: string;
  title: string;
  location?: string;
}

const formatEventTime = (dateStr: string) => {
  try {
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
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) + ` ${time}`;
  } catch {
    return dateStr;
  }
};

export function CalendarPanel() {
  const { data, error } = useSWR('/api/monitoring/calendar', fetcher, {
    refreshInterval: 60000, // refresh every minute
    shouldRetryOnError: false,
  });

  const isOffline = error?.message === '503';
  const events: CalEvent[] = data?.events || [];
  const now = new Date();
  const monthStr = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();

  return (
    <PeriodicTableCard
      symbol="Ca"
      name="Calendar"
      metric={isOffline ? '—' : events.length > 0 ? `${events.length}` : monthStr}
    >
      <div className="space-y-2">
        {isOffline ? (
          <div className="flex items-center space-x-1 text-xs">
            <WifiOff size={12} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              Calendar requires local access
            </span>
          </div>
        ) : error ? (
          <p className="text-xs text-destructive">Failed to load calendar</p>
        ) : !data ? (
          <div className="flex items-center space-x-1 text-xs">
            <Loader2 size={12} className="animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center space-x-1 text-xs">
            <Calendar size={12} className="text-muted-foreground" />
            <span className="text-muted-foreground">No upcoming events</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[160px] overflow-y-auto">
            {events.slice(0, 8).map((evt, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-start space-x-2 text-xs">
                  <Clock size={12} className="text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {evt.title}
                    </div>
                    <div className="text-muted-foreground">
                      {formatEventTime(evt.start)}
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
