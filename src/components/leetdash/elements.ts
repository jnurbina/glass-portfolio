// Single source of truth for the five periodic-table "elements" that
// make up the leet; dashboard. Each module owns one entry; the slug is
// the URL key (?view=<slug>) and the framer-motion layoutId seed.
//
// Display order = ELEMENTS array order. Atomic-number labels (01..05)
// follow this order, so any reordering ripples through automatically.

export type ElementSlug =
  | 'calendar'
  | 'tasks'
  | 'monitor'
  | 'agents'
  | 'activity';

export interface ElementMeta {
  slug: ElementSlug;
  symbol: string;
  name: string;
  // Tailwind color identifier — matched to the element's "atomic" tone.
  // Used for accent rings, hover glow, hero gradient, etc.
  accent: 'amber' | 'sky' | 'violet' | 'emerald' | 'rose';
}

export const ELEMENTS: ElementMeta[] = [
  { slug: 'calendar', symbol: 'Ca', name: 'Calendar', accent: 'sky' },
  { slug: 'tasks', symbol: 'Tk', name: 'Tasks', accent: 'amber' },
  { slug: 'monitor', symbol: 'Mn', name: 'Monitor', accent: 'rose' },
  { slug: 'agents', symbol: 'Ag', name: 'Agents', accent: 'violet' },
  { slug: 'activity', symbol: 'Ch', name: 'Activity', accent: 'emerald' },
];

const BY_SLUG = new Map(ELEMENTS.map((e) => [e.slug, e]));

export function getElement(slug: string): ElementMeta | null {
  return BY_SLUG.get(slug as ElementSlug) ?? null;
}

// Tailwind utility classes per accent. Resolved at compile time so the
// JIT picks them up — no `bg-${color}-500/20` dynamic strings.
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

// Layout positions on the overview grid (md+). Mobile: single column.
// Row 1 (3 cards × span 2 each):  calendar | tasks | monitor
// Row 2 (2 cards):                 agents (span 2) | activity (span 4)
//
// Tailwind needs literal class strings — keep these explicit so the JIT
// finds them.
export const COL_SPAN: Record<ElementSlug, string> = {
  calendar: 'md:col-span-2',
  tasks: 'md:col-span-2',
  monitor: 'md:col-span-2',
  agents: 'md:col-span-2',
  activity: 'md:col-span-4',
};
