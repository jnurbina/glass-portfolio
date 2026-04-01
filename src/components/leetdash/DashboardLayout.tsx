import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen p-0 m-0">
      <div className="flex flex-col space-y-6">
        {children}
      </div>
    </div>
  );
}
