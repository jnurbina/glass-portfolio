'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDot,
  Circle,
  Loader2,
  WifiOff,
} from 'lucide-react';
import {
  AgentActivity,
  ActivityType,
  BOT_NAME,
  deriveSessionLabel,
  describeEvent,
  shouldShowEvent,
  visibleStepCount,
} from './activityLabels';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });

const timeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

interface ActivityResponse {
  activities: AgentActivity[];
}

const TypeIcon = ({
  type,
  size = 12,
}: {
  type: ActivityType;
  size?: number;
}) => {
  switch (type) {
    case 'spawn':
      return <CircleDot size={size} className="shrink-0 text-emerald-400" />;
    case 'progress':
      return <Circle size={size} className="shrink-0 text-amber-400" />;
    case 'complete':
      return <CircleCheck size={size} className="shrink-0 text-emerald-500" />;
    case 'error':
      return <CircleAlert size={size} className="shrink-0 text-destructive" />;
  }
};

interface SessionGroup {
  agentId: string;
  primaryLabel: string;
  via: string;
  state: ActivityType;
  start: number;
  end: number;
  durationMs?: number;
  children: AgentActivity[];
}

function buildTree(activities: AgentActivity[]): SessionGroup[] {
  // Bucket events by runId (= W3C traceId, one per turn). Falls back to
  // parent/agent ids for legacy events without trace context.
  const buckets = new Map<string, AgentActivity[]>();
  const order: string[] = [];

  for (const a of activities) {
    const key = a.runId ?? a.parentAgentId ?? a.agentId;
    if (!key || key === 'unknown') continue;
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(a);
  }

  const result: SessionGroup[] = [];
  for (const key of order) {
    const list = buckets.get(key)!;
    list.sort((a, b) => a.timestamp - b.timestamp);
    const start = list[0].timestamp;
    const end = list[list.length - 1].timestamp;

    // State = last terminal event's type, falling back to the most
    // recent non-terminal type. Lets us color the row.
    let state: ActivityType = 'progress';
    for (let i = list.length - 1; i >= 0; i--) {
      const t = list[i].type;
      if (t === 'complete' || t === 'error') {
        state = t;
        break;
      }
      if (t === 'spawn') state = 'spawn';
    }

    const { primary, via } = deriveSessionLabel(list);

    result.push({
      agentId: key,
      primaryLabel: primary,
      via,
      state,
      start,
      end,
      durationMs: state === 'complete' || state === 'error' ? end - start : undefined,
      children: list,
    });
  }
  return result.sort((a, b) => b.end - a.end);
}

export function ActivityDetail() {
  const { data, error } = useSWR<ActivityResponse>(
    '/api/monitoring/activity?limit=200',
    fetcher,
    { refreshInterval: 5000, shouldRetryOnError: false },
  );

  const isOffline = error?.message === '503';
  const groups = useMemo(() => buildTree(data?.activities ?? []), [data]);
  const inProgress = groups.filter(
    (g) => g.state === 'spawn' || g.state === 'progress',
  ).length;

  return (
    <div className="space-y-6">
      {/* Top row: bot identity + status + open-gateway link */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/40 bg-muted/5 px-4 py-3 text-sm">
        {isOffline ? (
          <>
            <WifiOff size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Gateway offline</span>
          </>
        ) : !data ? (
          <>
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Connecting…</span>
          </>
        ) : (
          <>
            <Activity size={14} className="text-emerald-500" />
            <span className="text-foreground/90">
              <span className="font-mono text-emerald-300">{BOT_NAME}</span>
              <span className="mx-2 text-muted-foreground/60">·</span>
              <span className="font-mono">{inProgress}</span>{' '}
              {inProgress === 1 ? 'turn' : 'turns'} in progress
              <span className="mx-2 text-muted-foreground/60">·</span>
              <span className="font-mono">{groups.length}</span> total
            </span>
          </>
        )}
        <a
          href="https://chat.onejas.one"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300 transition-colors hover:bg-emerald-400/20"
        >
          Open chat
          <ArrowUpRight size={12} />
        </a>
      </div>

      {/* Quick legend — kept inline so it doesn't need a separate page. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-muted-foreground/60">
        <Legend>
          <strong className="text-muted-foreground/80">Turn</strong> — one
          user→bot exchange
        </Legend>
        <Legend>
          <strong className="text-muted-foreground/80">Step</strong> — an
          internal event during a turn
        </Legend>
      </div>

      {/* Sessions tree */}
      {groups.length > 0 ? (
        <div className="space-y-2">
          {groups.map((g, i) => (
            <SessionRow key={g.agentId} group={g} index={i} />
          ))}
        </div>
      ) : data ? (
        <p className="text-sm text-muted-foreground/70">No recent activity.</p>
      ) : null}
    </div>
  );
}

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
      {children}
    </span>
  );
}

function SessionRow({
  group,
  index,
}: {
  group: SessionGroup;
  index: number;
}) {
  const [open, setOpen] = useState(
    group.state === 'spawn' || group.state === 'progress',
  );
  const Chevron = open ? ChevronDown : ChevronRight;
  const { shown, total } = visibleStepCount(group.children);

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.4) }}
      className="rounded-md border border-border/30 bg-muted/5"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/10"
      >
        <Chevron size={12} className="shrink-0 text-muted-foreground" />
        <TypeIcon type={group.state} />
        <span className="font-mono text-sm text-foreground">
          {group.primaryLabel}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground/70">
          via {group.via}
        </span>
        <span
          className="ml-auto flex items-center gap-3 font-mono text-[11px] text-muted-foreground/60"
          title={`${total} raw events; ${shown} are shown when expanded`}
        >
          <span>{shown} steps</span>
          {group.durationMs != null && (
            <span>{(group.durationMs / 1000).toFixed(1)}s</span>
          )}
          <span>{timeAgo(group.end)}</span>
        </span>
      </button>
      {open && (
        <div className="space-y-0.5 border-t border-border/30 px-3 py-2 pl-9">
          {group.children.filter(shouldShowEvent).map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 py-0.5 text-[11px]"
            >
              <TypeIcon type={c.type} size={10} />
              <span className="text-foreground/80">{describeEvent(c)}</span>
            </div>
          ))}
          {shown === 0 && (
            <p className="text-[11px] italic text-muted-foreground/50">
              No notable steps yet.
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
