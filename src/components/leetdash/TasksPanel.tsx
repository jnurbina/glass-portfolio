'use client';

import { useState } from 'react';
import PeriodicTableCard from './PeriodicTableCard';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'leetdash-tasks';

const loadTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveTasks = (tasks: Task[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [input, setInput] = useState('');

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  const addTask = () => {
    if (!input.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: input.trim(),
      done: false,
      createdAt: Date.now(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setInput('');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    setTasks(updated);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  return (
    <PeriodicTableCard
      symbol="Tk"
      name="Tasks"
      metric={`${pending.length}`}
    >
      <div className="space-y-2">
        {/* Add task input */}
        <div className="flex items-center space-x-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add task..."
            className="flex-1 bg-transparent border-b border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary py-1"
          />
          <button
            onClick={addTask}
            className="p-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Task list */}
        <div className="space-y-1 max-h-[140px] overflow-y-auto">
          {pending.length === 0 && completed.length === 0 && (
            <p className="text-xs text-muted-foreground">No tasks yet</p>
          )}
          {pending.map((t) => (
            <div
              key={t.id}
              className="flex items-center space-x-2 text-xs group"
            >
              <button onClick={() => toggleTask(t.id)} className="shrink-0">
                <Circle
                  size={14}
                  className="text-muted-foreground hover:text-primary transition-colors"
                />
              </button>
              <span className="text-foreground truncate flex-1">
                {t.title}
              </span>
              <button
                onClick={() => deleteTask(t.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <Trash2 size={12} className="text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
          {completed.slice(0, 3).map((t) => (
            <div
              key={t.id}
              className="flex items-center space-x-2 text-xs group opacity-50"
            >
              <button onClick={() => toggleTask(t.id)} className="shrink-0">
                <CheckCircle2
                  size={14}
                  className="text-green-500"
                />
              </button>
              <span className="text-foreground truncate flex-1 line-through">
                {t.title}
              </span>
              <button
                onClick={() => deleteTask(t.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <Trash2 size={12} className="text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </PeriodicTableCard>
  );
}
