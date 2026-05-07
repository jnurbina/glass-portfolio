'use client';

import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });

interface AgentActivity {
  id: string;
  type: 'spawn' | 'progress' | 'complete' | 'error';
  agentLabel?: string;
  rawEventType: string;
  timestamp: number;
  runId?: string;
}

export function ActivitySummary() {
  const { data, error } = useSWR<{ activities: AgentActivity[] }>(
    '/api/monitoring/activity?limit=30',
    fetcher,
    { refreshInterval: 5000, shouldRetryOnError: false },
  );

  if (error) return <Hint>Gateway offline.</Hint>;
  if (!data) return <Skeleton />;

  const activities = data.activities ?? [];
  if (activities.length === 0) return <Hint>No activity.</Hint>;

  // Distinct turn count = distinct runIds.
  const turns = new Set(activities.map((a) => a.runId).filter(Boolean));
  const last = activities[activities.length - 1];
  const lastLabel = last?.agentLabel ?? last?.rawEventType ?? 'event';

  return (
    <div className="space-y-1 text-[11px]">
      <div className="font-mono uppercase tracking-[0.18em] text-muted-foreground/60">
        {turns.size} {turns.size === 1 ? 'turn' : 'turns'} ·{' '}
        {activities.length} events
      </div>
      <div className="truncate text-foreground/90">
        last: <span className="text-emerald-400">{lastLabel}</span>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-1.5">
      <div className="h-3 w-32 animate-pulse rounded bg-muted/30" />
      <div className="h-3 w-20 animate-pulse rounded bg-muted/30" />
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-muted-foreground/70">{children}</p>;
}
