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
        'group relative h-[280px] w-full rounded-2xl text-left',
        // Hover lift comes from the framer-motion props above; this is
        // just the soft glow that follows the card silhouette.
        'transition-[filter] duration-300',
        `hover:${palette.dropGlow}`,
      ].join(' ')}
    >
      {/* Card chrome layer — border, fill, accent, specular highlight.
          A vertical mask fades the entire chrome (border + bg) toward
          transparent at the bottom so the card visually dissolves into
          the page instead of terminating in a hard rectangle outline. */}
      <div
        aria-hidden
        className={[
          'absolute inset-0 overflow-hidden rounded-2xl',
          'border border-border/50 bg-card/40 backdrop-blur-sm',
          'transition-colors duration-300 group-hover:bg-card/60',
        ].join(' ')}
        style={{
          maskImage:
            'linear-gradient(to bottom, black 0%, black 62%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 62%, transparent 100%)',
        }}
      >
        {/* Accent wash — diagonal tint, each element's signature tone. */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${palette.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
        />

        {/* Specular highlight — a single soft, off-center radial spot
            that reads as light catching a curved glass surface. No
            repeating pattern, no scan-lines. Sits low in the card so
            the bright spot anchors the (already-fading) lower half. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 28% 78%, rgba(255,255,255,0.07), transparent 60%)',
          }}
        />

        {/* Inner top-edge highlight — a one-pixel light line that
            traces the visible curve of the glass, gives the card a
            subtle "looking down at it" feel. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />
      </div>

      {/* Content layer — sharp, NOT masked. */}
      <div className="relative z-10 flex h-full flex-col p-4">
        <ElementHead meta={meta} variant="grid" />
        <div className="mt-3 min-h-0 flex-1 overflow-hidden">
          <SummaryFor slug={meta.slug} />
        </div>
      </div>

      {/* Atomic-number identifier — sits inside the masked (faded)
          region as a watermark, ghosting through the bottom of the card. */}
      <div
        aria-hidden
        className="absolute bottom-2 right-3 z-10 font-mono text-[10px] tracking-[0.3em] text-muted-foreground/30"
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
