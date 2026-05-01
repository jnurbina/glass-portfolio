# HANDOFF: LeetDash ↔ OpenClaw Integration

## What is LeetDash?

Personal monitoring dashboard at `/leetdash` in the glass-portfolio site. Currently shows:
- **Tasks (Tk)** - Local task management with localStorage fallback
- **Calendar (Ca)** - Calendar panel
- **Agents (Ag)** - Agent session status (polls OpenClaw gateway)
- **Chat (Ch)** - Currently just a link to `chat.onejas.one` (simplified)
- **Monitor (Mn)** - System health + Vercel deployment status

Access: Blocked in production via middleware, accessible on preview deployments.

---

## Current API Routes

```
glass-portfolio (Next.js)              OpenClaw Gateway
─────────────────────────────          ─────────────────
/api/monitoring/agents      ────────►  /api/sessions
/api/monitoring/chat        ────────►  /api/sessions/main/messages  (unused now)
/api/monitoring/health      ────────►  (local systeminformation)
/api/monitoring/deployments ────────►  (Vercel API)
/api/monitoring/tasks       ────────►  (localStorage / Convex)
```

---

## What We Want: Agent Activity Feed

Instead of chat logs, show **agent lifecycle events**:

### Desired Data Shape
```typescript
interface AgentActivity {
  id: string;
  type: 'spawn' | 'progress' | 'complete' | 'error';
  agentId: string;
  agentLabel?: string;        // e.g., "gsd-planner", "research-agent"
  taskSummary?: string;       // what the agent is working on
  progress?: number;          // 0-100 if trackable
  timestamp: number;
  parentAgentId?: string;     // for nested/orchestrated agents
}
```

### UI Behavior
- Show when agent spawns (with label + task)
- Update progress if available
- Clear/fade when task completes
- Show errors if agent fails
- Visualize parent→child relationships for orchestrated agents

---

## Orchestration Tree Visualization

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LEETDASH DASHBOARD                          │
│                    (glass-portfolio on Vercel)                      │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ polls /api/monitoring/*
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES                             │
│                                                                     │
│  /agents ──────┐                                                    │
│  /chat ────────┼───► proxy to OPENCLAW_GATEWAY_URL                  │
│  /activity ────┘     (chat.onejas.one)                              │
│                                                                     │
│  /health ──────────► local systeminformation                        │
│  /deployments ─────► Vercel API                                     │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     OPENCLAW GATEWAY                                │
│                   (chat.onejas.one)                                 │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Trinity (Main Agent)                      │   │
│  │                                                              │   │
│  │   User Message                                               │   │
│  │        │                                                     │   │
│  │        ▼                                                     │   │
│  │   ┌─────────┐                                                │   │
│  │   │ Analyze │                                                │   │
│  │   └────┬────┘                                                │   │
│  │        │                                                     │   │
│  │        ├──────────► spawn: research-agent ──────┐            │   │
│  │        │                                        │            │   │
│  │        ├──────────► spawn: code-writer ─────────┼──► tasks   │   │
│  │        │                                        │            │   │
│  │        ├──────────► spawn: reviewer ────────────┘            │   │
│  │        │                                                     │   │
│  │        ▼                                                     │   │
│  │   ┌──────────┐                                               │   │
│  │   │ Aggregate│◄─────── results from child agents             │   │
│  │   └────┬─────┘                                               │   │
│  │        │                                                     │   │
│  │        ▼                                                     │   │
│  │   Response to User                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  NEED ENDPOINT:                                                     │
│  GET /api/activity ──► stream of AgentActivity events               │
│       or                                                            │
│  WS  /api/activity ──► real-time WebSocket feed                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Desired Agent Tree View (in ChatPanel)

```
┌─────────────────────────────────────────┐
│ Ch                          Activity  3 │
├─────────────────────────────────────────┤
│                                         │
│  ● Trinity                    active    │
│  ├─● research-agent          ██░░ 40%   │
│  ├─● code-writer             waiting    │
│  └─○ reviewer                pending    │
│                                         │
│  ─────────────────────────────────────  │
│  ✓ gsd-planner               2m ago     │
│  ✓ file-search               3m ago     │
│                                         │
│  ──────────── Open Gateway ───────────  │
│                                         │
└─────────────────────────────────────────┘

Legend:
● active/running    ○ pending/waiting    ✓ completed
```

---

## Next Steps for OpenClaw

1. **Expose `/api/activity` endpoint** returning `AgentActivity[]`
2. **Emit events** when agents spawn, progress, complete, or error
3. **Include parent-child relationships** for orchestration visibility
4. Optional: WebSocket for real-time updates (vs polling)

Once the endpoint exists, the ChatPanel in glass-portfolio will be updated to consume it.
