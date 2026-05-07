'use client';

import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });

interface AgentSession {
  id: string;
  state?: string;
}

export function AgentsSummary() {
  const { data, error } = useSWR('/api/monitoring/agents', fetcher, {
    refreshInterval: 15000,
    shouldRetryOnError: false,
  });

  if (error) return <Hint>Gateway offline.</Hint>;
  if (!data) return <Skeleton />;

  const sessions: AgentSession[] = data?.sessions || data || [];
  const list = Array.isArray(sessions) ? sessions : [];
  const active = list.filter(
    (s) => s.state === 'active' || s.state === 'running',
  ).length;

  return (
    <div className="space-y-1 text-[11px]">
      <div className="flex items-center gap-1.5">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
        </span>
        <span className="font-mono text-foreground/90">
          {active} active
        </span>
        <span className="text-muted-foreground/60">/ {list.length} total</span>
      </div>
      {list.length === 0 && <Hint>No sessions.</Hint>}
    </div>
  );
}

function Skeleton() {
  return <div className="h-3 w-24 animate-pulse rounded bg-muted/30" />;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-muted-foreground/70">{children}</p>;
}
