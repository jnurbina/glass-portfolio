'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';

type TaskId = Id<'tasks'>;

export function TasksDetail() {
  const tasks = useQuery(api.tasks.list);
  const create = useMutation(api.tasks.create);
  const toggle = useMutation(api.tasks.toggle);
  const remove = useMutation(api.tasks.remove);
  const [input, setInput] = useState('');

  const list = tasks ?? [];
  const pending = list.filter((t) => !t.done);
  const completed = list.filter((t) => t.done);

  const handleAdd = async () => {
    const title = input.trim();
    if (!title) return;
    setInput('');
    await create({ title });
  };

  return (
    <div className="space-y-8">
      {/* Composer */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="What needs doing?"
          className="flex-1 rounded-md border border-border/50 bg-background/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-amber-400/60 focus:outline-none"
        />
        <button
          onClick={handleAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 text-sm text-amber-300 transition-colors hover:bg-amber-400/20"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {/* Pending */}
      <Section
        title="Pending"
        count={pending.length}
        emptyHint="Nothing pending."
      >
        {pending.map((t, i) => (
          <Row
            key={t._id}
            i={i}
            id={t._id}
            title={t.title}
            done={false}
            onToggle={(id) => toggle({ id })}
            onDelete={(id) => remove({ id })}
          />
        ))}
      </Section>

      {/* Completed */}
      <Section
        title="Completed"
        count={completed.length}
        emptyHint="No history."
      >
        {completed.map((t, i) => (
          <Row
            key={t._id}
            i={i}
            id={t._id}
            title={t.title}
            done={true}
            onToggle={(id) => toggle({ id })}
            onDelete={(id) => remove({ id })}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  count,
  emptyHint,
  children,
}: {
  title: string;
  count: number;
  emptyHint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
          {title}
        </h3>
        <span className="font-mono text-xs text-muted-foreground/50">
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="text-xs text-muted-foreground/70">{emptyHint}</p>
      ) : (
        <ul className="space-y-1">{children}</ul>
      )}
    </div>
  );
}

function Row({
  i,
  id,
  title,
  done,
  onToggle,
  onDelete,
}: {
  i: number;
  id: TaskId;
  title: string;
  done: boolean;
  onToggle: (id: TaskId) => void;
  onDelete: (id: TaskId) => void;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.02, duration: 0.25 }}
      className={`group flex items-center gap-3 rounded-md border border-transparent px-2 py-1.5 hover:border-border/40 hover:bg-muted/10 ${done ? 'opacity-50' : ''}`}
    >
      <button onClick={() => onToggle(id)} className="shrink-0">
        {done ? (
          <CheckCircle2 size={16} className="text-emerald-500" />
        ) : (
          <Circle
            size={16}
            className="text-muted-foreground hover:text-amber-300"
          />
        )}
      </button>
      <span
        className={`flex-1 text-sm text-foreground ${done ? 'line-through' : ''}`}
      >
        {title}
      </span>
      <button
        onClick={() => onDelete(id)}
        className="opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Delete task"
      >
        <Trash2
          size={14}
          className="text-muted-foreground hover:text-destructive"
        />
      </button>
    </motion.li>
  );
}
