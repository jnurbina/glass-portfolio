'use client';

import PeriodicTableCard from './PeriodicTableCard';
import { MessageSquare, ExternalLink } from 'lucide-react';

export function ChatPanel() {
  return (
    <PeriodicTableCard
      symbol="Ch"
      name="Chat"
      metric="→"
    >
      <div className="flex flex-col items-center justify-center h-[180px] space-y-4">
        <MessageSquare size={32} className="text-cyan-500" />
        <p className="text-sm text-muted-foreground text-center">
          Chat with Trinity via OpenClaw
        </p>
        <a
          href="https://chat.onejas.one"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 rounded-lg transition-all text-primary"
        >
          <ExternalLink size={16} />
          <span className="font-medium">Open Chat Gateway</span>
        </a>
      </div>
    </PeriodicTableCard>
  );
}
