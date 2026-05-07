'use client';

import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });

interface Health {
  cpu?: { load?: number };
  memory?: { percent?: number };
  disk?: { percent?: number };
  error?: string;
}

export function MonitorSummary() {
  const { data, error } = useSWR<Health>('/api/monitoring/health', fetcher, {
    refreshInterval: 10000,
  });

  if (error || data?.error) return <Hint>Health unavailable.</Hint>;
  if (!data) return <Skeleton />;

  const cpu = data.cpu?.load ?? 0;
  const mem = data.memory?.percent ?? 0;

  return (
    <div className="space-y-2 text-[11px]">
      <Bar label="CPU" pct={cpu} />
      <Bar label="MEM" pct={mem} />
    </div>
  );
}

function Bar({ label, pct }: { label: string; pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-muted-foreground/70 tracking-[0.18em]">
          {label}
        </span>
        <span className="font-mono text-foreground/90">
          {clamped.toFixed(0)}%
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted/30">
        <div
          className="h-full bg-rose-400/80"
          style={{ width: `${clamped}%`, transition: 'width 600ms ease-out' }}
        />
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-full animate-pulse rounded bg-muted/30" />
      <div className="h-3 w-full animate-pulse rounded bg-muted/30" />
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-muted-foreground/70">{children}</p>;
}
