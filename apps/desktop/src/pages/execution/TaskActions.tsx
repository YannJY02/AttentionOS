import { CheckCircle2, Pause, Play, Send } from 'lucide-react';
import type { TaskLifecycleApi } from '../../hooks/useTaskLifecycle';

interface TaskActionsProps {
  readonly task: TaskLifecycleApi;
}

const baseButtonClass = 'inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium text-sm';

export function TaskActions({ task }: TaskActionsProps) {
  return (
    <div className="rounded-md border border-stone-200 bg-white p-5">
      <p className="font-medium text-stone-950">Task controls</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {task.state === 'planning' ? (
          <button
            className={`${baseButtonClass} bg-stone-950 text-white`}
            onClick={task.start}
            type="button"
          >
            <Play aria-hidden="true" size={16} />
            Start task
          </button>
        ) : null}

        {task.state === 'executing' ? (
          <>
            <button
              className={`${baseButtonClass} border border-stone-300 text-stone-800`}
              onClick={task.pause}
              type="button"
            >
              <Pause aria-hidden="true" size={16} />
              Pause task
            </button>
            <button
              className={`${baseButtonClass} bg-sky-700 text-white`}
              onClick={task.submitForReview}
              type="button"
            >
              <Send aria-hidden="true" size={16} />
              Submit for review
            </button>
          </>
        ) : null}

        {task.state === 'paused' ? (
          <button
            className={`${baseButtonClass} bg-stone-950 text-white`}
            onClick={task.resume}
            type="button"
          >
            <Play aria-hidden="true" size={16} />
            Resume task
          </button>
        ) : null}

        {task.state === 'reviewing' ? (
          <button
            className={`${baseButtonClass} bg-emerald-700 text-white`}
            onClick={task.complete}
            type="button"
          >
            <CheckCircle2 aria-hidden="true" size={16} />
            Complete task
          </button>
        ) : null}
      </div>
    </div>
  );
}
