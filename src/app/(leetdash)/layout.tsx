import { ThemeProvider } from '@/components/providers/theme-provider';
import { Bebas_Neue, Manrope, Fira_Code } from 'next/font/google';
import React from 'react';

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas-neue',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
});

// Nested layout — does NOT render <html>/<body> (root layout owns those).
// Provides the dashboard-specific theme + font CSS vars on a wrapper div
// so they cascade only into the leet; surface, not the public portfolio.
export default function LeetDashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div
        className={`${bebas.variable} ${manrope.variable} ${firaCode.variable}`}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}
