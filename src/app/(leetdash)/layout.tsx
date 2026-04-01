
import { ThemeProvider } from @/components/providers/theme-provider;
import { ThemeToggle } from @/components/leetdash/ThemeToggle;
import { Bebas_Neue, Manrope, Fira_Code } from next/font/google;

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});
import React from 'react';

export default function LeetDashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={}>
<body>
<ThemeProvider attribute="class" defaultTheme="dark"><div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col">
        <div className="text-2xl font-bold mb-6 text-primary">LeetDash</div>
        <nav className="flex-grow">
          {/* Add navigation links here later */}
          <ul className="space-y-2">
            <li>
              <a href="/leetdash" className="block p-2 rounded-lg hover:bg-muted transition-colors">Dashboard</a>
            </li>
            {/* More links */}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div></ThemeProvider></body></html>
  );
}

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeToggle } from "@/components/leetdash/ThemeToggle";
import { Bebas_Neue, Manrope, Fira_Code } from "next/font/google";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

// Assuming the original content is in a variable or we need to wrap it
// This is a simplified append, a proper edit would be needed
// For now, let's just make sure the file can be wrapped
// Let's replace the whole file with the wrapped version
