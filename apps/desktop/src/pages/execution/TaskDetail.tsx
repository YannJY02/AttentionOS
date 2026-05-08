import type { TaskLifecycleApi } from '../../hooks/useTaskLifecycle';

interface TaskDetailProps {
  readonly task: TaskLifecycleApi;
}

export function TaskDetail({ task }: TaskDetailProps) {
  return (
    <div className="rounded-md border border-stone-200 bg-white p-5">
      <p className="font-medium text-sky-700 text-sm">Active task</p>
      <h2 className="mt-2 font-semibold text-2xl text-stone-950">{task.title}</h2>
      <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
        <p className="rounded-md bg-stone-50 p-3 text-stone-700">State: {task.state}</p>
        <p className="rounded-md bg-stone-50 p-3 text-stone-700">
          Estimated: {task.estimatedMinutes} min
        </p>
        <p className="rounded-md bg-stone-50 p-3 text-stone-700">
          Actual: {task.actualMinutes} min
        </p>
      </div>
    </div>
  );
}
