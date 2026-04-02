import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeToggle } from "@/components/leetdash/ThemeToggle";
import { Bebas_Neue, Manrope, Fira_Code } from "next/font/google";
import React from "react";

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

export default function LeetDashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${manrope.variable} ${firaCode.variable}`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border p-4 flex flex-col">
              <div className="text-2xl font-bold mb-6 font-display text-primary">
                LeetDash
              </div>
              <nav className="flex-grow">
                <ul className="space-y-2">
                  <li>
                    <a
                      href="/leetdash"
                      className="block p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      Dashboard
                    </a>
                  </li>
                </ul>
              </nav>
              <div className="mt-auto pt-4 border-t border-border">
                <ThemeToggle />
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
