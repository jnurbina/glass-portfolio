// Translation layer for OpenClaw diagnostic events into plain English
// for the activity feed. Keeps the renderer focused on layout and
// keeps human-facing copy in one place.

export type ActivityType = 'spawn' | 'progress' | 'complete' | 'error';

export interface AgentActivity {
  id: string;
  type: ActivityType;
  agentId: string;
  agentLabel?: string;
  taskSummary?: string;
  timestamp: number;
  parentAgentId?: string;
  runId?: string;
  rawEventType: string;
  error?: string;
}

// The bot persona running on the gateway this dashboard talks to.
// Jason's profile (cs-jason.onejas.one) runs `bb.soji`.
//
// If we ever fan out to multiple profiles (Soji's `my.Json` lives at
// cs-soji.onejas.one), thread the identity through the activity feed
// or pull it from a per-profile config endpoint instead of hardcoding.
export const BOT_NAME = 'bb.soji';

// Event types the user genuinely wants to see in an expanded session.
// Everything else (queue lanes, session state pings, redundant run/
// harness pairs, etc.) is infrastructure noise and gets hidden.
const SHOWN_TYPES = new Set([
  'message.queued',
  'message.processed',
  'context.assembled',
  'harness.run.started',
  'harness.run.completed',
  'harness.run.error',
  'model.call.started',
  'model.call.completed',
  'model.call.error',
  'tool.execution.started',
  'tool.execution.completed',
  'tool.execution.error',
  'tool.execution.blocked',
  'session.stuck',
]);

export function shouldShowEvent(a: AgentActivity): boolean {
  return SHOWN_TYPES.has(a.rawEventType);
}

// Pretty-print an event for the expanded child list. Keep these terse
// — they show as one line in the tree, not a paragraph.
export function describeEvent(a: AgentActivity): string {
  const t = a.rawEventType;

  // Helper: strip a "key:" prefix that the plugin's normalizer adds.
  const after = (prefix: string) =>
    a.taskSummary?.startsWith(prefix)
      ? a.taskSummary.slice(prefix.length)
      : a.taskSummary;

  switch (t) {
    case 'message.queued': {
      // taskSummary is "from:<source>" or "user message queued"
      const src = after('from:');
      if (src && src !== a.taskSummary) {
        return `user message arrived${src === 'dispatch' ? '' : ` (${src})`}`;
      }
      return 'user message arrived';
    }

    case 'message.processed': {
      // taskSummary is "outcome:<outcome> (<ms>ms)" — re-format with seconds.
      if (a.type === 'error') {
        return a.error ? `replied with error: ${a.error}` : 'replied with error';
      }
      const m = a.taskSummary?.match(/\((\d+)ms\)/);
      const secs = m ? (parseInt(m[1], 10) / 1000).toFixed(1) : null;
      return secs ? `replied to user (${secs}s)` : 'replied to user';
    }

    case 'context.assembled':
      return 'context prepared';

    case 'harness.run.started':
      return 'agent started thinking';

    case 'harness.run.completed':
      return 'agent finished thinking';

    case 'harness.run.error':
      return a.error
        ? `agent step errored: ${a.error}`
        : 'agent step errored';

    case 'model.call.started':
      return a.agentLabel ? `calling ${a.agentLabel}` : 'calling model';

    case 'model.call.completed':
      return a.agentLabel
        ? `${a.agentLabel} responded`
        : 'model responded';

    case 'model.call.error':
      return a.error
        ? `model error: ${a.error}`
        : 'model errored';

    case 'tool.execution.started':
      return a.agentLabel ? `running tool: ${a.agentLabel}` : 'running tool';

    case 'tool.execution.completed':
      return a.agentLabel ? `tool done: ${a.agentLabel}` : 'tool done';

    case 'tool.execution.error':
      return a.agentLabel
        ? `tool error: ${a.agentLabel}`
        : a.error
          ? `tool error: ${a.error}`
          : 'tool error';

    case 'tool.execution.blocked':
      return a.agentLabel
        ? `tool blocked: ${a.agentLabel}`
        : a.error
          ? `tool blocked: ${a.error}`
          : 'tool blocked';

    case 'session.stuck':
      return `session stuck${a.error ? `: ${a.error}` : ''}`;

    default:
      return a.taskSummary ?? a.rawEventType;
  }
}

// The most useful headline for a session: the model used, falling back
// to whatever's available. Walks the events newest-first so a later
// model.call.* on a session that switches models still wins.
export function deriveSessionLabel(activities: AgentActivity[]): {
  primary: string;
  via: string;
} {
  // Most recent model.call.* with an agentLabel = the model name.
  for (let i = activities.length - 1; i >= 0; i--) {
    const a = activities[i];
    if (a.rawEventType.startsWith('model.call') && a.agentLabel) {
      return { primary: a.agentLabel, via: BOT_NAME };
    }
  }
  // Otherwise show the channel (webchat/discord/etc).
  for (const a of activities) {
    if (a.rawEventType === 'message.queued' && a.agentLabel) {
      return { primary: a.agentLabel, via: BOT_NAME };
    }
  }
  return { primary: 'awaiting model…', via: BOT_NAME };
}

// "47 events" → "47 steps · only 5 shown"-style for the tooltip text.
export function visibleStepCount(activities: AgentActivity[]): {
  shown: number;
  total: number;
} {
  let shown = 0;
  for (const a of activities) if (shouldShowEvent(a)) shown++;
  return { shown, total: activities.length };
}
