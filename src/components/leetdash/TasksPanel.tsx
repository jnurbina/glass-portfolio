'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import PeriodicTableCard from './PeriodicTableCard';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

type TaskId = Id<'tasks'>;

export function TasksPanel() {
  const tasks = useQuery(api.tasks.list);
  const create = useMutation(api.tasks.create);
  const toggle = useMutation(api.tasks.toggle);
  const remove = useMutation(api.tasks.remove);
  const [input, setInput] = useState('');

  const loaded = tasks !== undefined;
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
    <PeriodicTableCard symbol="Tk" name="Tasks" metric={`${pending.length}`}>
      <div className="space-y-2">
        <div className="flex items-center space-x-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add task..."
            className="flex-1 bg-transparent border-b border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary py-1"
          />
          <button
            onClick={handleAdd}
            className="p-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-1 max-h-[140px] overflow-y-auto">
          {loaded && pending.length === 0 && completed.length === 0 && (
            <p className="text-xs text-muted-foreground">No tasks yet</p>
          )}
          {pending.map((t) => (
            <TaskRow
              key={t._id}
              id={t._id}
              title={t.title}
              done={false}
              onToggle={(id) => toggle({ id })}
              onDelete={(id) => remove({ id })}
            />
          ))}
          {completed.slice(0, 3).map((t) => (
            <TaskRow
              key={t._id}
              id={t._id}
              title={t.title}
              done={true}
              onToggle={(id) => toggle({ id })}
              onDelete={(id) => remove({ id })}
            />
          ))}
        </div>
      </div>
    </PeriodicTableCard>
  );
}

function TaskRow({
  id,
  title,
  done,
  onToggle,
  onDelete,
}: {
  id: TaskId;
  title: string;
  done: boolean;
  onToggle: (id: TaskId) => void;
  onDelete: (id: TaskId) => void;
}) {
  return (
    <div
      className={`flex items-center space-x-2 text-xs group ${done ? 'opacity-50' : ''}`}
    >
      <button onClick={() => onToggle(id)} className="shrink-0">
        {done ? (
          <CheckCircle2 size={14} className="text-green-500" />
        ) : (
          <Circle
            size={14}
            className="text-muted-foreground hover:text-primary transition-colors"
          />
        )}
      </button>
      <span
        className={`text-foreground truncate flex-1 ${done ? 'line-through' : ''}`}
      >
        {title}
      </span>
      <button
        onClick={() => onDelete(id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        <Trash2
          size={12}
          className="text-muted-foreground hover:text-destructive"
        />
      </button>
    </div>
  );
}
