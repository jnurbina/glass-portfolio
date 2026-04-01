import React from 'react';

export default function LeetDashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background text-foreground">
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
    </div>
  );
}
