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

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });

const timeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

type ActivityType = 'spawn' | 'progress' | 'complete' | 'error';

interface AgentActivity {
  id: string;
  type: ActivityType;
  agentId: string;
  agentLabel?: string;
  taskSummary?: string;
  timestamp: number;
  parentAgentId?: string;
  runId?: string;
  rawEventType: string;
  error?: string;
}

interface ActivityResponse {
  activities: AgentActivity[];
  totalEventsSeen: number;
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
  rootLabel: string;
  state: ActivityType;
  start: number;
  end: number;
  durationMs?: number;
  children: AgentActivity[];
}

function shortAgent(id: string): string {
  if (!id || id === 'unknown') return id;
  if (/^[0-9a-f]{8}/.test(id)) return id.slice(0, 8);
  const parts = id.split(':');
  if (parts.length > 1) return parts[parts.length - 1];
  return id;
}

function buildTree(activities: AgentActivity[]): SessionGroup[] {
  const groups = new Map<string, SessionGroup>();
  const order: string[] = [];

  for (const a of activities) {
    const key = a.runId ?? a.parentAgentId ?? a.agentId;
    if (!key || key === 'unknown') continue;
    let g = groups.get(key);
    if (!g) {
      g = {
        agentId: key,
        rootLabel: a.agentLabel ?? shortAgent(key),
        state: a.type,
        start: a.timestamp,
        end: a.timestamp,
        children: [],
      };
      groups.set(key, g);
      order.push(key);
    }
    g.children.push(a);
    g.end = Math.max(g.end, a.timestamp);
    if (a.type === 'complete' || a.type === 'error') {
      g.state = a.type;
      g.durationMs = g.end - g.start;
    } else if (a.type === 'spawn' && g.state !== 'complete' && g.state !== 'error') {
      g.state = 'spawn';
      g.rootLabel = a.agentLabel ?? g.rootLabel;
    } else if (g.state !== 'complete' && g.state !== 'error') {
      g.state = 'progress';
    }
  }

  const result = order
    .map((k) => groups.get(k)!)
    .filter(Boolean)
    .sort((a, b) => b.end - a.end);
  for (const g of result) g.children.sort((a, b) => a.timestamp - b.timestamp);
  return result;
}

export function ActivityDetail() {
  const { data, error } = useSWR<ActivityResponse>(
    '/api/monitoring/activity?limit=200',
    fetcher,
    { refreshInterval: 5000, shouldRetryOnError: false },
  );

  const isOffline = error?.message === '503';
  const groups = useMemo(() => buildTree(data?.activities ?? []), [data]);
  const inFlight = groups.filter(
    (g) => g.state === 'spawn' || g.state === 'progress',
  ).length;

  return (
    <div className="space-y-6">
      {/* Top stat row */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/40 bg-muted/5 px-4 py-3 text-sm">
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
              <span className="font-mono">{inFlight}</span> in flight ·{' '}
              <span className="font-mono">{groups.length}</span> sessions ·{' '}
              <span className="font-mono">{data.totalEventsSeen}</span> events
            </span>
          </>
        )}
        <a
          href="https://chat.onejas.one"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300 transition-colors hover:bg-emerald-400/20"
        >
          Open Gateway
          <ArrowUpRight size={12} />
        </a>
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
          {group.rootLabel}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground/60">
          {group.children.length} events
        </span>
        {group.durationMs != null && (
          <span className="font-mono text-[11px] text-muted-foreground/60">
            {(group.durationMs / 1000).toFixed(1)}s
          </span>
        )}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground/60">
          {timeAgo(group.end)}
        </span>
      </button>
      {open && (
        <div className="space-y-0.5 border-t border-border/30 px-3 py-2 pl-9">
          {group.children.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 py-0.5 text-[11px]"
            >
              <TypeIcon type={c.type} size={10} />
              <span className="font-mono text-muted-foreground truncate">
                {c.taskSummary || c.rawEventType}
              </span>
              {c.error && (
                <span className="ml-auto truncate text-destructive">
                  {c.error}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
