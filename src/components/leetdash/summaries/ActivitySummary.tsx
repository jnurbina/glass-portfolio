'use client';

import useSWR from 'swr';
import {
  AgentActivity,
  BOT_NAME,
  describeEvent,
  shouldShowEvent,
} from '../details/activityLabels';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });

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

  // Distinct turns = distinct runIds.
  const turns = new Set(activities.map((a) => a.runId).filter(Boolean));

  // Last "interesting" event — skip queue/state noise.
  const last = [...activities].reverse().find(shouldShowEvent);

  return (
    <div className="space-y-1 text-[11px]">
      <div className="font-mono uppercase tracking-[0.18em] text-muted-foreground/60">
        {turns.size} {turns.size === 1 ? 'turn' : 'turns'} · via {BOT_NAME}
      </div>
      {last && (
        <div className="truncate text-foreground/90">
          last: <span className="text-emerald-400">{describeEvent(last)}</span>
        </div>
      )}
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
