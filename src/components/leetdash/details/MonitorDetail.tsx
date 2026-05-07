'use client';

import useSWR from 'swr';
import { motion } from 'framer-motion';
import {
  CircleCheck,
  CircleX,
  Cpu,
  HardDrive,
  Loader2,
  MemoryStick,
  Rocket,
} from 'lucide-react';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

const timeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const StateIcon = ({ state }: { state: string }) => {
  switch (state) {
    case 'READY':
      return <CircleCheck size={14} className="text-emerald-500" />;
    case 'ERROR':
      return <CircleX size={14} className="text-destructive" />;
    case 'BUILDING':
    case 'INITIALIZING':
    case 'QUEUED':
      return <Loader2 size={14} className="animate-spin text-amber-400" />;
    case 'CANCELED':
      return <CircleX size={14} className="text-muted-foreground" />;
    default:
      return <CircleCheck size={14} className="text-muted-foreground" />;
  }
};

export function MonitorDetail() {
  const { data: health, error: healthErr } = useSWR(
    '/api/monitoring/health',
    fetcher,
    { refreshInterval: 10000 },
  );

  const { data: deploys, error: deploysErr } = useSWR(
    '/api/monitoring/deployments',
    fetcher,
    { refreshInterval: 30000 },
  );

  return (
    <div className="space-y-8">
      {/* System health */}
      <section className="space-y-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
          System
        </h3>
        {!health && !healthErr ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : healthErr || health?.error ? (
          <p className="text-sm text-destructive">Health unavailable.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Gauge
              icon={<Cpu size={14} className="text-rose-400" />}
              label="CPU"
              pct={health.cpu.load}
              detail={`${health.cpu.load}%`}
            />
            <Gauge
              icon={<MemoryStick size={14} className="text-rose-400" />}
              label="Memory"
              pct={health.memory.percent}
              detail={`${formatBytes(health.memory.used)} / ${formatBytes(health.memory.total)}`}
            />
            {health.disk && (
              <Gauge
                icon={<HardDrive size={14} className="text-rose-400" />}
                label="Disk"
                pct={health.disk.percent}
                detail={`${health.disk.percent.toFixed(1)}%`}
              />
            )}
          </div>
        )}
      </section>

      {/* Deploys */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Rocket size={14} className="text-rose-400" />
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
            Deploys
          </h3>
        </div>
        {!deploys && !deploysErr ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : deploysErr ? (
          <p className="text-sm text-destructive">Deploys unavailable.</p>
        ) : (
          <ul className="space-y-1">
            {(deploys?.deployments ?? []).map(
              (
                d: {
                  id: string;
                  state: string;
                  branch: string | null;
                  commitMessage: string | null;
                  created: number;
                },
                i: number,
              ) => (
                <motion.li
                  key={d.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 rounded-md border border-border/30 bg-muted/5 px-3 py-2"
                >
                  <StateIcon state={d.state} />
                  <span className="font-mono text-sm text-foreground">
                    {d.branch || 'deploy'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground/80">
                    {d.commitMessage ?? ''}
                  </span>
                  <span className="ml-auto whitespace-nowrap font-mono text-[11px] text-muted-foreground/60">
                    {timeAgo(d.created)}
                  </span>
                </motion.li>
              ),
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

function Gauge({
  icon,
  label,
  pct,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  pct: number;
  detail: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="rounded-lg border border-border/30 bg-muted/5 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground/70">
          {label}
        </span>
      </div>
      <div className="mt-3 font-mono text-2xl text-foreground">
        {clamped.toFixed(0)}%
      </div>
      <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground/60">
        {detail}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted/30">
        <div
          className="h-full bg-rose-400/80"
          style={{ width: `${clamped}%`, transition: 'width 600ms ease-out' }}
        />
      </div>
    </div>
  );
}
