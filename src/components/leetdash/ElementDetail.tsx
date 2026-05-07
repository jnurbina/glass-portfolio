'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ACCENT, ElementMeta } from './elements';
import { ElementHead } from './ElementCard';
import { TasksDetail } from './details/TasksDetail';
import { CalendarDetail } from './details/CalendarDetail';
import { AgentsDetail } from './details/AgentsDetail';
import { ActivityDetail } from './details/ActivityDetail';
import { MonitorDetail } from './details/MonitorDetail';

interface ElementDetailProps {
  meta: ElementMeta;
  onClose: () => void;
}

// Full-screen detail overlay. The symbol/name/metric morph from the
// grid card via shared layoutIds; everything else fades+slides in.
export function ElementDetail({ meta, onClose }: ElementDetailProps) {
  const palette = ACCENT[meta.accent];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-30 flex items-stretch justify-center"
    >
      {/* Click-anywhere-outside-to-close scrim. */}
      <button
        type="button"
        aria-label="Close detail"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-background/70 backdrop-blur-md"
      />

      <motion.section
        initial={{ y: 8 }}
        animate={{ y: 0 }}
        exit={{ y: 8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto mt-16 mb-8 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-2xl"
      >
        {/* Hero accent gradient. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${palette.gradient}`}
        />

        {/* Close affordance. */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground"
          aria-label="Return to dashboard"
        >
          <X size={16} />
        </button>

        {/* Hero header — same content as the card, framer-motion morphs it in. */}
        <div className="relative z-10 px-8 pt-12 pb-6">
          <ElementHead meta={meta} variant="detail" />
        </div>

        {/* Body content — fades in after the morph. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex-1 overflow-y-auto border-t border-border/40 bg-background/20 px-8 py-8"
        >
          <DetailFor slug={meta.slug} />
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

function DetailFor({ slug }: { slug: ElementMeta['slug'] }) {
  switch (slug) {
    case 'tasks':
      return <TasksDetail />;
    case 'calendar':
      return <CalendarDetail />;
    case 'agents':
      return <AgentsDetail />;
    case 'activity':
      return <ActivityDetail />;
    case 'monitor':
      return <MonitorDetail />;
  }
}
