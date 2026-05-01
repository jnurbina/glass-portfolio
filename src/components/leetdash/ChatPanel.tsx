'use client';

import useSWR from 'swr';
import PeriodicTableCard from './PeriodicTableCard';
import {
  Activity,
  ArrowUpRight,
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

const TypeIcon = ({ type }: { type: ActivityType }) => {
  switch (type) {
    case 'spawn':
      return <CircleDot size={12} className="text-cyan-500 shrink-0" />;
    case 'progress':
      return <Circle size={12} className="text-yellow-500 shrink-0" />;
    case 'complete':
      return <CircleCheck size={12} className="text-green-500 shrink-0" />;
    case 'error':
      return <CircleAlert size={12} className="text-destructive shrink-0" />;
  }
};

// Compact label: prefer agentLabel, fall back to a trimmed agentId.
function labelFor(a: AgentActivity): string {
  if (a.agentLabel) return a.agentLabel;
  if (a.agentId === 'unknown') return a.rawEventType;
  // Long UUIDs get hashed-out for readability
  if (/^[0-9a-f]{8}-/.test(a.agentId)) return a.agentId.slice(0, 8);
  return a.agentId;
}

// "In-flight" agentIds = saw a spawn without a later complete/error for the same id.
function countInFlight(activities: AgentActivity[]): number {
  const state = new Map<string, ActivityType>();
  for (const a of activities) {
    if (a.type === 'spawn') state.set(a.agentId, 'spawn');
    else if (a.type === 'complete' || a.type === 'error') state.set(a.agentId, a.type);
  }
  let n = 0;
  for (const v of state.values()) if (v === 'spawn') n++;
  return n;
}

export function ChatPanel() {
  const { data, error } = useSWR<ActivityResponse>(
    '/api/monitoring/activity?limit=30',
    fetcher,
    { refreshInterval: 5000, shouldRetryOnError: false },
  );

  const isOffline = error?.message === '503';
  const isMisconfigured = error?.message === '500' || error?.message === '502';
  const activities = (data?.activities ?? []).slice().reverse(); // newest first
  const inFlight = countInFlight(data?.activities ?? []);
  const recent = activities.slice(0, 6);

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
                {inFlight} in flight / {data.totalEventsSeen} total
              </span>
            </>
          )}
        </div>

        {/* Activity feed */}
        {recent.length > 0 ? (
          <div className="space-y-1 max-h-[140px] overflow-y-auto">
            {recent.map((a) => (
              <div key={a.id} className="flex items-center space-x-2 text-xs">
                <TypeIcon type={a.type} />
                <span className="font-mono text-foreground truncate max-w-[110px]">
                  {labelFor(a)}
                </span>
                {a.taskSummary && (
                  <span className="text-muted-foreground truncate max-w-[80px]">
                    {a.taskSummary}
                  </span>
                )}
                <span className="text-muted-foreground ml-auto shrink-0">
                  {timeAgo(a.timestamp)}
                </span>
              </div>
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
