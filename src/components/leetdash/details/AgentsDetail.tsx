'use client';

import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Bot, CircleCheck, CirclePause, CircleX, Wifi, WifiOff } from 'lucide-react';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });

const timeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
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
      return <CircleCheck size={14} className="text-emerald-500" />;
    case 'idle':
    case 'waiting':
      return <CirclePause size={14} className="text-amber-400" />;
    case 'error':
    case 'failed':
      return <CircleX size={14} className="text-destructive" />;
    default:
      return <Bot size={14} className="text-muted-foreground" />;
  }
};

export function AgentsDetail() {
  const { data, error } = useSWR('/api/monitoring/agents', fetcher, {
    refreshInterval: 15000,
    shouldRetryOnError: false,
  });

  const isOffline = error?.message === '503';
  const sessions: AgentSession[] = data?.sessions || data || [];
  const list = Array.isArray(sessions) ? sessions : [];
  const active = list.filter(
    (s) => s.state === 'active' || s.state === 'running',
  );
  const idle = list.filter((s) => !active.includes(s));

  return (
    <div className="space-y-6">
      {/* Connection */}
      <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/5 px-4 py-3">
        {isOffline ? (
          <>
            <WifiOff size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Gateway offline (cs-jason.onejas.one)
            </span>
          </>
        ) : !data && !error ? (
          <span className="text-sm text-muted-foreground">Connecting…</span>
        ) : error ? (
          <span className="text-sm text-destructive">
            Error: {error.message}
          </span>
        ) : (
          <>
            <Wifi size={16} className="text-emerald-500" />
            <span className="text-sm text-foreground/90">
              <span className="font-mono">{active.length}</span> active ·{' '}
              <span className="font-mono">{list.length}</span> total
            </span>
          </>
        )}
      </div>

      {list.length > 0 && (
        <>
          {active.length > 0 && (
            <SessionGroup title="Active" sessions={active} />
          )}
          {idle.length > 0 && <SessionGroup title="Idle" sessions={idle} />}
        </>
      )}
    </div>
  );
}

function SessionGroup({
  title,
  sessions,
}: {
  title: string;
  sessions: AgentSession[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
          {title}
        </h3>
        <span className="font-mono text-xs text-muted-foreground/50">
          {sessions.length}
        </span>
      </div>
      <ul className="space-y-1">
        {sessions.map((s, i) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-center gap-3 rounded-md border border-border/30 bg-muted/5 px-3 py-2"
          >
            <StateIcon state={s.state} />
            <span className="font-mono text-sm text-foreground">
              {s.label || s.kind || s.id.substring(0, 12)}
            </span>
            {s.model && (
              <span className="rounded border border-violet-400/30 bg-violet-400/10 px-1.5 py-0.5 font-mono text-[10px] text-violet-300">
                {s.model.split('/').pop()}
              </span>
            )}
            {s.lastActivity && (
              <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">
                {timeAgo(s.lastActivity)}
              </span>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
