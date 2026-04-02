'use client';

import useSWR from 'swr';
import PeriodicTableCard from './PeriodicTableCard';
import { Cpu, HardDrive, MemoryStick, Rocket, CircleCheck, CircleX, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
      return <CircleCheck size={14} className="text-green-500" />;
    case 'ERROR':
      return <CircleX size={14} className="text-destructive" />;
    case 'BUILDING':
    case 'INITIALIZING':
    case 'QUEUED':
      return <Loader2 size={14} className="animate-spin text-yellow-500" />;
    case 'CANCELED':
      return <CircleX size={14} className="text-muted-foreground" />;
    default:
      return <CircleCheck size={14} className="text-muted-foreground" />;
  }
};

const MetricRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center space-x-2 text-sm">
    {icon}
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-mono text-foreground">{value}</span>
  </div>
);

export function MonitoringPanel() {
  const { data: health, error: healthErr } = useSWR(
    '/api/monitoring/health',
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: deploys, error: deploysErr } = useSWR(
    '/api/monitoring/deployments',
    fetcher,
    { refreshInterval: 30000 }
  );

  const cpuLabel = health?.cpu?.load ? `${health.cpu.load}%` : '...';

  return (
    <PeriodicTableCard symbol="Mn" name="Monitor" metric={cpuLabel}>
      <div className="space-y-3">
        {/* System Health */}
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            System
          </div>
          {!health && !healthErr && (
            <p className="text-xs text-muted-foreground">Loading...</p>
          )}
          {healthErr && (
            <p className="text-xs text-destructive">Health unavailable</p>
          )}
          {health && !health.error && (
            <>
              <MetricRow
                icon={<Cpu size={14} />}
                label="CPU"
                value={`${health.cpu.load}%`}
              />
              <MetricRow
                icon={<MemoryStick size={14} />}
                label="Mem"
                value={`${health.memory.percent}% (${formatBytes(health.memory.used)} / ${formatBytes(health.memory.total)})`}
              />
              {health.disk && (
                <MetricRow
                  icon={<HardDrive size={14} />}
                  label="Disk"
                  value={`${health.disk.percent.toFixed(1)}%`}
                />
              )}
            </>
          )}
        </div>

        {/* Vercel Deployments */}
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Deploys
          </div>
          {!deploys && !deploysErr && (
            <p className="text-xs text-muted-foreground">Loading...</p>
          )}
          {deploysErr && (
            <p className="text-xs text-destructive">Deploys unavailable</p>
          )}
          {deploys?.deployments?.map(
            (d: {
              id: string;
              state: string;
              branch: string | null;
              commitMessage: string | null;
              created: number;
            }) => (
              <div
                key={d.id}
                className="flex items-center space-x-2 text-xs"
              >
                <StateIcon state={d.state} />
                <span className="font-mono text-foreground truncate max-w-[120px]">
                  {d.branch || 'deploy'}
                </span>
                <span className="text-muted-foreground truncate max-w-[100px]">
                  {d.commitMessage
                    ? d.commitMessage.substring(0, 30)
                    : ''}
                </span>
                <span className="text-muted-foreground ml-auto whitespace-nowrap">
                  {timeAgo(d.created)}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </PeriodicTableCard>
  );
}
