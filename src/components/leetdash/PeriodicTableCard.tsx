import React from 'react';

interface PeriodicTableCardProps {
  symbol: string;
  name: string;
  metric: string | number;
  children: React.ReactNode;
}

export default function PeriodicTableCard({
  symbol,
  name,
  metric,
  children,
}: PeriodicTableCardProps) {
  return (
    <div className="relative overflow-hidden rounded-t-lg bg-card/60 border-t border-l border-r border-border p-4 shadow-md backdrop-blur-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="text-5xl font-extrabold font-display text-primary-foreground leading-none">
          {symbol}
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">{name}</div>
          <div className="text-xl font-semibold text-foreground">{metric}</div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}
