import { Timer } from 'lucide-react';
import type { TaskLifecycleApi } from '../../hooks/useTaskLifecycle';

interface TaskTimerProps {
  readonly task: TaskLifecycleApi;
}

export function TaskTimer({ task }: TaskTimerProps) {
  return (
    <div className="rounded-md border border-stone-200 bg-white p-5">
      <p className="inline-flex items-center gap-2 font-medium text-stone-950">
        <Timer aria-hidden="true" size={18} />
        Focus timer
      </p>
      <p className="mt-2 text-sm text-stone-600">Actual: {task.actualMinutes} min</p>
      <button
        className="mt-4 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={task.state !== 'executing'}
        onClick={task.tickFiveMinutes}
        type="button"
      >
        Add 5 minutes
      </button>
    </div>
  );
}
