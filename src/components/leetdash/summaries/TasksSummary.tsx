'use client';

import { useQuery } from 'convex/react';
import { Circle, CheckCircle2 } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';

export function TasksSummary() {
  const tasks = useQuery(api.tasks.list);
  if (!tasks) return <SkeletonRows />;

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  if (pending.length === 0 && completed.length === 0) {
    return <Hint>No tasks.</Hint>;
  }

  return (
    <div className="space-y-1.5 text-[11px]">
      <div className="font-mono uppercase tracking-[0.18em] text-muted-foreground/60">
        {pending.length} pending · {completed.length} done
      </div>
      <ul className="space-y-1">
        {pending.slice(0, 3).map((t) => (
          <li key={t._id} className="flex items-center gap-2">
            <Circle size={10} className="shrink-0 text-muted-foreground" />
            <span className="truncate text-foreground/90">{t.title}</span>
          </li>
        ))}
        {pending.length === 0 &&
          completed.slice(0, 3).map((t) => (
            <li
              key={t._id}
              className="flex items-center gap-2 text-foreground/50 line-through"
            >
              <CheckCircle2 size={10} className="shrink-0 text-emerald-500" />
              <span className="truncate">{t.title}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-1.5">
      <div className="h-3 w-24 animate-pulse rounded bg-muted/30" />
      <div className="h-3 w-full animate-pulse rounded bg-muted/30" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-muted/30" />
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-muted-foreground/70">{children}</p>;
}
