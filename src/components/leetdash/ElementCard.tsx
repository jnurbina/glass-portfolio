'use client';

import { motion } from 'framer-motion';
import { ACCENT, ElementMeta } from './elements';
import { TasksSummary } from './summaries/TasksSummary';
import { CalendarSummary } from './summaries/CalendarSummary';
import { AgentsSummary } from './summaries/AgentsSummary';
import { ActivitySummary } from './summaries/ActivitySummary';
import { MonitorSummary } from './summaries/MonitorSummary';

interface ElementCardProps {
  meta: ElementMeta;
  index: number;
  onActivate: () => void;
  inactive: boolean;
}

// One periodic-table cell on the overview grid. Click activates the
// detail overlay; framer-motion animates the symbol/name/metric block
// into the detail hero via shared layoutIds.
export function ElementCard({
  meta,
  index,
  onActivate,
  inactive,
}: ElementCardProps) {
  const palette = ACCENT[meta.accent];

  return (
    <motion.button
      type="button"
      onClick={onActivate}
      disabled={inactive}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -3,
        transition: { duration: 0.18, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98 }}
      className={[
        'group relative flex h-[260px] flex-col justify-between overflow-hidden rounded-xl text-left',
        'border border-border/50 bg-card/40 p-4 backdrop-blur-sm',
        'transition-shadow duration-300 hover:bg-card/60',
        `hover:${palette.glow}`,
      ].join(' ')}
    >
      {/* Subtle accent gradient — gives each element its own tone. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${palette.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Atomic-number style identifier. */}
      <div
        aria-hidden
        className="absolute top-3 right-3 z-10 font-mono text-[10px] tracking-widest text-muted-foreground/60"
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      <ElementHead meta={meta} variant="grid" />

      {/* Each module's compact summary content. */}
      <div className="relative z-10 mt-3 min-h-0 flex-1 overflow-hidden">
        <SummaryFor slug={meta.slug} />
      </div>
    </motion.button>
  );
}

// Shared symbol/name/metric block — has framer-motion layoutIds so it
// morphs cleanly into the ElementDetail hero on activation.
export function ElementHead({
  meta,
  variant,
  metric,
}: {
  meta: ElementMeta;
  variant: 'grid' | 'detail';
  metric?: string | number;
}) {
  const palette = ACCENT[meta.accent];
  const symbolSize = variant === 'grid' ? 'text-6xl' : 'text-9xl';
  const nameSize = variant === 'grid' ? 'text-xs' : 'text-base';
  const metricSize = variant === 'grid' ? 'text-base' : 'text-3xl';

  return (
    <div className="relative z-10 flex items-start justify-between">
      <motion.div
        layoutId={`elem-symbol-${meta.slug}`}
        className={`font-display ${symbolSize} font-bold leading-none tracking-tight ${palette.text}`}
      >
        {meta.symbol}
      </motion.div>
      <motion.div
        layoutId={`elem-meta-${meta.slug}`}
        className="text-right"
      >
        <div
          className={`font-mono uppercase tracking-[0.2em] text-muted-foreground ${nameSize}`}
        >
          {meta.name}
        </div>
        {metric !== undefined && (
          <div className={`font-mono font-semibold text-foreground ${metricSize}`}>
            {metric}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function SummaryFor({ slug }: { slug: ElementMeta['slug'] }) {
  switch (slug) {
    case 'tasks':
      return <TasksSummary />;
    case 'calendar':
      return <CalendarSummary />;
    case 'agents':
      return <AgentsSummary />;
    case 'activity':
      return <ActivitySummary />;
    case 'monitor':
      return <MonitorSummary />;
  }
}
