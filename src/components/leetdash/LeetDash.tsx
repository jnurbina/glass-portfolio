'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { ELEMENTS, getElement } from './elements';
import { ElementCard } from './ElementCard';
import { ElementDetail } from './ElementDetail';

// The whole leet; dashboard. Single page that flips between the
// periodic-table grid and a per-element detail view via ?view=<slug>.
//
// framer-motion's LayoutGroup makes the shared layoutId animations work
// across the grid → detail transition. The grid stays mounted (and dimmed)
// behind the detail so the morph doesn't tear when entries unmount.
export function LeetDash() {
  const params = useSearchParams();
  const router = useRouter();
  const view = params.get('view');
  const active = view ? getElement(view) : null;

  const close = useCallback(() => {
    router.replace('/leetdash', { scroll: false });
  }, [router]);

  // Esc closes the detail view.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close]);

  const open = useCallback(
    (slug: string) => {
      const sp = new URLSearchParams(params);
      sp.set('view', slug);
      router.replace(`/leetdash?${sp.toString()}`, { scroll: false });
    },
    [params, router],
  );

  return (
    <LayoutGroup>
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <BackgroundField />

        <Header />
        <FloatingThemeToggle />

        {/* Grid view — always mounted, dimmed when a detail is open. */}
        <motion.section
          aria-hidden={!!active}
          animate={{
            opacity: active ? 0.15 : 1,
            filter: active ? 'blur(8px)' : 'blur(0px)',
            scale: active ? 0.97 : 1,
          }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {ELEMENTS.map((el, i) => (
              <ElementCard
                key={el.slug}
                meta={el}
                index={i}
                onActivate={() => open(el.slug)}
                inactive={!!active}
              />
            ))}
          </div>
        </motion.section>

        {/* Detail overlay. */}
        <AnimatePresence>
          {active && (
            <ElementDetail key={active.slug} meta={active} onClose={close} />
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

// Wordmark fixed to the top-left. Reserved for the "leet;" brand.
function Header() {
  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-40 px-6 pt-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="pointer-events-auto group select-none"
          onClick={() => {
            // Click the wordmark to return home from any detail view.
            window.location.href = '/leetdash';
          }}
        >
          <span className="font-mono text-lg tracking-tight text-foreground/80 transition-colors group-hover:text-foreground">
            leet
            <span className="text-foreground/40 group-hover:text-foreground/70">
              ;
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

function FloatingThemeToggle() {
  return (
    <div className="pointer-events-none fixed top-3 right-3 z-40">
      <div className="pointer-events-auto rounded-full border border-border/60 bg-card/40 backdrop-blur-md">
        <ThemeToggle />
      </div>
    </div>
  );
}

// Subtle ambient grid behind everything — gives the page a "lab"
// surface without competing with the elements.
function BackgroundField() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:64px_64px] opacity-[0.05]"
      />
    </>
  );
}
