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
        'group relative flex h-[280px] w-full flex-col justify-start overflow-hidden rounded-2xl text-left',
        'border border-border/50 bg-card/40 p-4 pb-6 backdrop-blur-sm',
        'transition-shadow duration-300 hover:bg-card/60',
        `hover:${palette.glow}`,
      ].join(' ')}
    >
      {/* Accent wash — diagonal tint giving each element its own tone. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${palette.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
      />

      {/* Glassy ripple reflection — horizontal scan-lines in the bottom
          half, faded in/out via mask so it reads as a soft band of light
          rather than a hard texture. The repeating gradient is rotated
          1deg from horizontal so it looks faintly liquid. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -1deg,
            transparent 0,
            transparent 4px,
            rgba(255,255,255,0.05) 4px,
            rgba(255,255,255,0.05) 5px
          )`,
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 30%, black 75%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 30%, black 75%, transparent 100%)',
        }}
      />

      {/* Bottom fade-out so the card melts into the page rather than
          terminating in a hard rectangle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-background/50"
      />

      <ElementHead meta={meta} variant="grid" />

      {/* Each module's compact summary content. */}
      <div className="relative z-10 mt-3 min-h-0 flex-1 overflow-hidden">
        <SummaryFor slug={meta.slug} />
      </div>

      {/* Atomic-number identifier — bottom-right, sitting above the
          reflection layer. Small, low-contrast, just a marker. */}
      <div
        aria-hidden
        className="absolute bottom-2.5 right-3 z-10 font-mono text-[10px] tracking-[0.3em] text-muted-foreground/50"
      >
        {String(index + 1).padStart(2, '0')}
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
