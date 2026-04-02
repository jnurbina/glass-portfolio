'use client';

import { useState, useEffect, useCallback } from 'react';
import PeriodicTableCard from './PeriodicTableCard';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  done: boolean;
  createdAt: number;
  completedAt?: number;
}

const STORAGE_KEY = 'leetdash-tasks';
const API_BASE = '/api/monitoring/tasks';

// Try API first, fall back to localStorage
const useTaskStore = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [useLocal, setUseLocal] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load tasks
  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setUseLocal(false);
        setLoaded(true);
        return;
      }
    } catch {
      // API unavailable
    }
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setTasks(raw ? JSON.parse(raw) : []);
    } catch {
      setTasks([]);
    }
    setUseLocal(true);
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const saveLocal = (updated: Task[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTasks(updated);
  };

  const addTask = async (title: string) => {
    if (useLocal) {
      const newTask: Task = {
        _id: crypto.randomUUID(),
        title,
        done: false,
        createdAt: Date.now(),
      };
      saveLocal([newTask, ...tasks]);
    } else {
      try {
        await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        await loadTasks();
      } catch {
        // Fallback
        const newTask: Task = {
          _id: crypto.randomUUID(),
          title,
          done: false,
          createdAt: Date.now(),
        };
        saveLocal([newTask, ...tasks]);
        setUseLocal(true);
      }
    }
  };

  const toggleTask = async (id: string) => {
    if (useLocal) {
      const updated = tasks.map((t) =>
        t._id === id
          ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : undefined }
          : t
      );
      saveLocal(updated);
    } else {
      try {
        await fetch(`${API_BASE}/${id}`, { method: 'PATCH' });
        await loadTasks();
      } catch {
        const updated = tasks.map((t) =>
          t._id === id ? { ...t, done: !t.done } : t
        );
        saveLocal(updated);
        setUseLocal(true);
      }
    }
  };

  const deleteTask = async (id: string) => {
    if (useLocal) {
      saveLocal(tasks.filter((t) => t._id !== id));
    } else {
      try {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        await loadTasks();
      } catch {
        saveLocal(tasks.filter((t) => t._id !== id));
        setUseLocal(true);
      }
    }
  };

  return { tasks, loaded, useLocal, addTask, toggleTask, deleteTask };
};

export function TasksPanel() {
  const { tasks, loaded, addTask, toggleTask, deleteTask } = useTaskStore();
  const [input, setInput] = useState('');

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  const handleAdd = () => {
    if (!input.trim()) return;
    addTask(input.trim());
    setInput('');
  };

  return (
    <PeriodicTableCard symbol="Tk" name="Tasks" metric={`${pending.length}`}>
      <div className="space-y-2">
        {/* Add task input */}
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

        {/* Task list */}
        <div className="space-y-1 max-h-[140px] overflow-y-auto">
          {loaded && pending.length === 0 && completed.length === 0 && (
            <p className="text-xs text-muted-foreground">No tasks yet</p>
          )}
          {pending.map((t) => (
            <div
              key={t._id}
              className="flex items-center space-x-2 text-xs group"
            >
              <button onClick={() => toggleTask(t._id)} className="shrink-0">
                <Circle
                  size={14}
                  className="text-muted-foreground hover:text-primary transition-colors"
                />
              </button>
              <span className="text-foreground truncate flex-1">
                {t.title}
              </span>
              <button
                onClick={() => deleteTask(t._id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <Trash2
                  size={12}
                  className="text-muted-foreground hover:text-destructive"
                />
              </button>
            </div>
          ))}
          {completed.slice(0, 3).map((t) => (
            <div
              key={t._id}
              className="flex items-center space-x-2 text-xs group opacity-50"
            >
              <button onClick={() => toggleTask(t._id)} className="shrink-0">
                <CheckCircle2 size={14} className="text-green-500" />
              </button>
              <span className="text-foreground truncate flex-1 line-through">
                {t.title}
              </span>
              <button
                onClick={() => deleteTask(t._id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <Trash2
                  size={12}
                  className="text-muted-foreground hover:text-destructive"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </PeriodicTableCard>
  );
}
