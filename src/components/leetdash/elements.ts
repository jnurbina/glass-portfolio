// Single source of truth for the five periodic-table "elements" that
// make up the leet; dashboard. Each module owns one entry; the slug is
// the URL key (?view=<slug>) and the framer-motion layoutId seed.

export type ElementSlug =
  | 'tasks'
  | 'calendar'
  | 'agents'
  | 'activity'
  | 'monitor';

export interface ElementMeta {
  slug: ElementSlug;
  symbol: string;
  name: string;
  // Tailwind color identifier — matched to the element's "atomic" tone.
  // Used for accent rings, hover glow, hero gradient, etc.
  accent: 'amber' | 'sky' | 'violet' | 'emerald' | 'rose';
}

export const ELEMENTS: ElementMeta[] = [
  { slug: 'tasks', symbol: 'Tk', name: 'Tasks', accent: 'amber' },
  { slug: 'calendar', symbol: 'Ca', name: 'Calendar', accent: 'sky' },
  { slug: 'agents', symbol: 'Ag', name: 'Agents', accent: 'violet' },
  { slug: 'activity', symbol: 'Ch', name: 'Activity', accent: 'emerald' },
  { slug: 'monitor', symbol: 'Mn', name: 'Monitor', accent: 'rose' },
];

const BY_SLUG = new Map(ELEMENTS.map((e) => [e.slug, e]));

export function getElement(slug: string): ElementMeta | null {
  return BY_SLUG.get(slug as ElementSlug) ?? null;
}

// Tailwind utility classes per accent. Resolved at compile time so
// Tailwind's JIT picks them up. Kept in one place to avoid
// `bg-${color}-500/20`-style dynamic strings the JIT can't see.
export const ACCENT: Record<
  ElementMeta['accent'],
  {
    text: string;
    glow: string;
    ring: string;
    gradient: string;
  }
> = {
  amber: {
    text: 'text-amber-400',
    glow: 'shadow-[0_0_40px_-10px_rgba(251,191,36,0.55)]',
    ring: 'ring-amber-400/40',
    gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
  },
  sky: {
    text: 'text-sky-400',
    glow: 'shadow-[0_0_40px_-10px_rgba(56,189,248,0.55)]',
    ring: 'ring-sky-400/40',
    gradient: 'from-sky-500/15 via-sky-500/5 to-transparent',
  },
  violet: {
    text: 'text-violet-400',
    glow: 'shadow-[0_0_40px_-10px_rgba(167,139,250,0.55)]',
    ring: 'ring-violet-400/40',
    gradient: 'from-violet-500/15 via-violet-500/5 to-transparent',
  },
  emerald: {
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_40px_-10px_rgba(52,211,153,0.55)]',
    ring: 'ring-emerald-400/40',
    gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
  },
  rose: {
    text: 'text-rose-400',
    glow: 'shadow-[0_0_40px_-10px_rgba(251,113,133,0.55)]',
    ring: 'ring-rose-400/40',
    gradient: 'from-rose-500/15 via-rose-500/5 to-transparent',
  },
};
