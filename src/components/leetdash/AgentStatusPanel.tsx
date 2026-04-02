'use client';

import useSWR from 'swr';
import PeriodicTableCard from './PeriodicTableCard';
import {
  Bot,
  CircleCheck,
  CirclePause,
  CircleX,
  Loader2,
  Wifi,
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

interface AgentSession {
  id: string;
  label?: string;
  kind?: string;
  state?: string;
  lastActivity?: number;
  model?: string;
}

const StateIcon = ({ state }: { state?: string }) => {
  switch (state) {
    case 'active':
    case 'running':
      return <CircleCheck size={12} className="text-green-500" />;
    case 'idle':
    case 'waiting':
      return <CirclePause size={12} className="text-yellow-500" />;
    case 'error':
    case 'failed':
      return <CircleX size={12} className="text-destructive" />;
    default:
      return <Bot size={12} className="text-muted-foreground" />;
  }
};

export function AgentStatusPanel() {
  const { data, error } = useSWR('/api/monitoring/agents', fetcher, {
    refreshInterval: 15000,
    shouldRetryOnError: false,
  });

  const isOffline = error?.message === '503';
  const sessions: AgentSession[] = data?.sessions || data || [];
  const activeCount = Array.isArray(sessions)
    ? sessions.filter(
        (s) => s.state === 'active' || s.state === 'running'
      ).length
    : 0;

  return (
    <PeriodicTableCard
      symbol="Ag"
      name="Agents"
      metric={isOffline ? '—' : Array.isArray(sessions) ? `${sessions.length}` : '...'}
    >
      <div className="space-y-2">
        {/* Connection status */}
        <div className="flex items-center space-x-1 text-xs">
          {isOffline ? (
            <>
              <WifiOff size={12} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                Gateway offline
              </span>
            </>
          ) : error ? (
            <span className="text-destructive text-xs">Error loading agents</span>
          ) : !data ? (
            <>
              <Loader2 size={12} className="animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Connecting...</span>
            </>
          ) : (
            <>
              <Wifi size={12} className="text-green-500" />
              <span className="text-muted-foreground">
                {activeCount} active / {sessions.length} total
              </span>
            </>
          )}
        </div>

        {/* Agent list */}
        {Array.isArray(sessions) && sessions.length > 0 && (
          <div className="space-y-1 max-h-[140px] overflow-y-auto">
            {sessions.slice(0, 10).map((s) => (
              <div
                key={s.id}
                className="flex items-center space-x-2 text-xs"
              >
                <StateIcon state={s.state} />
                <span className="font-mono text-foreground truncate max-w-[100px]">
                  {s.label || s.kind || s.id.substring(0, 8)}
                </span>
                {s.model && (
                  <span className="text-muted-foreground truncate max-w-[60px]">
                    {s.model.split('/').pop()}
                  </span>
                )}
                {s.lastActivity && (
                  <span className="text-muted-foreground ml-auto">
                    {timeAgo(s.lastActivity)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PeriodicTableCard>
  );
}
