'use client';

import useSWR from 'swr';
import PeriodicTableCard from './PeriodicTableCard';
import { Wifi, Cpu, HardDrive, MemoryStick } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const MetricDisplay = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="flex items-center space-x-2 text-sm">
        {icon}
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-mono text-foreground">{value}</span>
    </div>
);


export function MonitoringPanel() {
  const { data, error } = useSWR('/api/monitoring/health', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  const isLoading = !data && !error;

  return (
    <PeriodicTableCard symbol="Mn" name="Monitor" metric={data?.cpu?.load ? `${data.cpu.load}%` : '...'}>
        <div className="space-y-2">
            {isLoading && <p className="text-muted-foreground">Loading system metrics...</p>}
            {error && <p className="text-destructive">Failed to load metrics.</p>}
            {data && (
                <>
                    <MetricDisplay icon={<Cpu size={16} />} label="CPU" value={`${data.cpu.load}%`} />
                    <MetricDisplay icon={<MemoryStick size={16} />} label="Mem" value={`${data.memory.percent}% (${formatBytes(data.memory.used)} / ${formatBytes(data.memory.total)})`} />
                    {data.disk && <MetricDisplay icon={<HardDrive size={16} />} label="Disk" value={`${data.disk.percent.toFixed(2)}% (${formatBytes(data.disk.used)} / ${formatBytes(data.disk.total)})`} />}
                </>
            )}
        </div>
    </PeriodicTableCard>
  );
}
