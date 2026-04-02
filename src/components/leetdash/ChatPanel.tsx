'use client';

import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import PeriodicTableCard from './PeriodicTableCard';
import {
  Send,
  WifiOff,
  Loader2,
  MessageSquare,
  User,
  Bot,
} from 'lucide-react';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export function ChatPanel() {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, error, mutate } = useSWR('/api/monitoring/chat?limit=15', fetcher, {
    refreshInterval: 5000,
    shouldRetryOnError: false,
  });

  const isOffline = error?.message === '503';
  const messages: ChatMessage[] = data?.messages || localMessages;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    // Optimistic local update
    const optimistic: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setLocalMessages((prev) => [...prev, optimistic]);

    try {
      await fetch('/api/monitoring/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      // Refresh messages after sending
      await mutate();
    } catch {
      // Keep optimistic message, it'll sync on next poll
    } finally {
      setSending(false);
    }
  };

  const RoleIcon = ({ role }: { role: string }) => {
    if (role === 'user') return <User size={12} className="text-primary shrink-0" />;
    if (role === 'assistant') return <Bot size={12} className="text-cyan-400 shrink-0" />;
    return <MessageSquare size={12} className="text-muted-foreground shrink-0" />;
  };

  return (
    <PeriodicTableCard
      symbol="Ch"
      name="Chat"
      metric={isOffline ? '—' : messages.length > 0 ? `${messages.length}` : '0'}
    >
      <div className="flex flex-col space-y-2 h-[180px]">
        {isOffline ? (
          <div className="flex items-center space-x-1 text-xs flex-1 justify-center">
            <WifiOff size={12} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              Chat requires local gateway
            </span>
          </div>
        ) : (
          <>
            {/* Messages area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-1.5 min-h-0"
            >
              {!data && !error && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={14} className="animate-spin text-muted-foreground" />
                </div>
              )}
              {messages.length === 0 && data && (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  No messages yet
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className="flex items-start space-x-1.5 text-xs"
                >
                  <RoleIcon role={msg.role} />
                  <p
                    className={`leading-relaxed break-words min-w-0 ${
                      msg.role === 'user'
                        ? 'text-foreground'
                        : msg.role === 'assistant'
                          ? 'text-cyan-300'
                          : 'text-muted-foreground italic'
                    }`}
                  >
                    {msg.content.length > 200
                      ? msg.content.substring(0, 200) + '…'
                      : msg.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="flex items-center space-x-1 border-t border-border pt-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Message Trinity..."
                disabled={sending}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none py-1 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="p-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
              >
                {sending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </PeriodicTableCard>
  );
}
