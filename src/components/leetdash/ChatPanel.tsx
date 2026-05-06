'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import PeriodicTableCard from './PeriodicTableCard';
import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDot,
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
  if (diff < 1000) return 'now';
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
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
  bufferSize: number;
  bufferLimit: number;
  totalEventsSeen: number;
  serverTime: number;
}

const TypeIcon = ({ type, size = 12 }: { type: ActivityType; size?: number }) => {
  switch (type) {
    case 'spawn':
      return <CircleDot size={size} className="text-cyan-500 shrink-0" />;
    case 'progress':
      return <Circle size={size} className="text-yellow-500 shrink-0" />;
    case 'complete':
      return <CircleCheck size={size} className="text-green-500 shrink-0" />;
    case 'error':
      return <CircleAlert size={size} className="text-destructive shrink-0" />;
  }
};

// Collapse "agent:main:main" / long UUIDs into something compact + readable.
function shortAgent(id: string): string {
  if (!id || id === 'unknown') return id;
  if (/^[0-9a-f]{8}-/.test(id)) return id.slice(0, 8);
  // agent:main:main → main
  const parts = id.split(':');
  if (parts.length > 1) return parts[parts.length - 1];
  return id;
}

interface SessionGroup {
  agentId: string;
  rootLabel: string;
  state: ActivityType;
  start: number;
  end: number; // most recent timestamp
  durationMs?: number;
  children: AgentActivity[];
}

/**
 * Group activities by trace (runId = W3C traceId). All events from one
 * gateway session share a runId, so each branch surfaces the full agent
 * lifecycle for that session — harness, run, model.call, tool.execution,
 * and queue/state plumbing — as a flat ordered child list.
 *
 * Future iteration: nest events by parentAgentId (= W3C parentSpanId) for
 * a true tree. Today's renderer treats children as a flat transcript.
 *
 * Edge cases:
 *  - Events without a runId fall back to parentAgentId, then agentId.
 *    Lifecycle events always carry runId; legacy events (message.queued,
 *    queue.lane.*, session.*) get one via the normalizer's fallback chain.
 *  - "unknown" agentId events attach to the most-recent in-flight group
 *    so they don't dangle as orphans.
 */
function buildTree(activities: AgentActivity[]): SessionGroup[] {
  const groups = new Map<string, SessionGroup>();
  const order: string[] = [];

  const ensureGroup = (a: AgentActivity): SessionGroup | null => {
    const key = a.runId ?? a.parentAgentId ?? a.agentId;
    if (!key || key === 'unknown') return null;
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
    return g;
  };

  // First pass: every non-unknown event creates / extends its group.
  for (const a of activities) {
    const g = ensureGroup(a);
    if (!g) continue;
    g.children.push(a);
    g.end = Math.max(g.end, a.timestamp);
    // Last terminal event sets the visual state.
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

  // Second pass: attach orphan "unknown" events to the most-recent in-flight
  // group whose start <= the orphan's timestamp.
  const orphans = activities.filter((a) => a.agentId === 'unknown');
  for (const o of orphans) {
    let target: SessionGroup | undefined;
    for (const k of order) {
      const g = groups.get(k);
      if (g && g.start <= o.timestamp && (!target || g.start > target.start)) target = g;
    }
    if (target) {
      target.children.push(o);
      target.end = Math.max(target.end, o.timestamp);
    }
  }

  // Sort groups by most-recent activity (newest first) and children chrono.
  const result = order
    .map((k) => groups.get(k)!)
    .filter(Boolean)
    .sort((a, b) => b.end - a.end);
  for (const g of result) g.children.sort((a, b) => a.timestamp - b.timestamp);
  return result;
}

function countInFlight(groups: SessionGroup[]): number {
  return groups.filter((g) => g.state === 'spawn' || g.state === 'progress').length;
}

const SessionRow = ({ group }: { group: SessionGroup }) => {
  const [open, setOpen] = useState(group.state === 'spawn' || group.state === 'progress');
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center space-x-1.5 text-xs hover:bg-primary/5 rounded px-1 py-0.5 transition-colors"
      >
        <Chevron size={10} className="text-muted-foreground shrink-0" />
        <TypeIcon type={group.state} />
        <span className="font-mono text-foreground truncate max-w-[110px] text-left">
          {group.rootLabel}
        </span>
        <span className="text-muted-foreground text-[10px] shrink-0">
          {group.children.length}
        </span>
        {group.durationMs != null && (
          <span className="text-muted-foreground text-[10px] shrink-0">
            {(group.durationMs / 1000).toFixed(1)}s
          </span>
        )}
        <span className="text-muted-foreground ml-auto shrink-0">
          {timeAgo(group.end)}
        </span>
      </button>
      {open && (
        <div className="pl-4 space-y-0.5 border-l border-border/40 ml-2">
          {group.children.map((c) => (
            <div key={c.id} className="flex items-center space-x-1.5 text-[11px] py-0.5">
              <TypeIcon type={c.type} size={10} />
              <span className="font-mono text-muted-foreground truncate max-w-[180px]">
                {c.taskSummary || c.rawEventType}
              </span>
              {c.error && (
                <span className="text-destructive truncate max-w-[120px]">{c.error}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function ChatPanel() {
  const { data, error } = useSWR<ActivityResponse>(
    '/api/monitoring/activity?limit=50',
    fetcher,
    { refreshInterval: 5000, shouldRetryOnError: false },
  );

  const isOffline = error?.message === '503';
  const isMisconfigured = error?.message === '500' || error?.message === '502';

  const groups = useMemo(() => buildTree(data?.activities ?? []), [data]);
  const inFlight = countInFlight(groups);
  const recentGroups = groups.slice(0, 5);

  return (
    <PeriodicTableCard
      symbol="Ch"
      name="Activity"
      metric={isOffline ? '—' : data ? `${inFlight}` : '...'}
    >
      <div className="space-y-2">
        {/* Connection state */}
        <div className="flex items-center space-x-1 text-xs">
          {isOffline ? (
            <>
              <WifiOff size={12} className="text-muted-foreground" />
              <span className="text-muted-foreground">Gateway offline</span>
            </>
          ) : isMisconfigured ? (
            <>
              <CircleAlert size={12} className="text-destructive" />
              <span className="text-destructive">Gateway error</span>
            </>
          ) : !data ? (
            <>
              <Loader2 size={12} className="animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Connecting...</span>
            </>
          ) : (
            <>
              <Activity size={12} className="text-green-500" />
              <span className="text-muted-foreground">
                {inFlight} in flight / {groups.length} sessions / {data.totalEventsSeen} events
              </span>
            </>
          )}
        </div>

        {/* Tree of recent sessions */}
        {recentGroups.length > 0 ? (
          <div className="max-h-[180px] overflow-y-auto space-y-0.5">
            {recentGroups.map((g) => (
              <SessionRow key={g.agentId} group={g} />
            ))}
          </div>
        ) : data ? (
          <p className="text-xs text-muted-foreground italic">No recent activity</p>
        ) : null}

        {/* Open Gateway link */}
        <a
          href="https://chat.onejas.one"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-1 px-3 py-1.5 mt-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 rounded-md transition-all text-primary text-xs"
        >
          <span>Open Gateway</span>
          <ArrowUpRight size={12} />
        </a>
      </div>
    </PeriodicTableCard>
  );
}
