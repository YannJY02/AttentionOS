import { Activity, CheckCircle2, Lightbulb } from 'lucide-react';
import { getLearningSnapshot } from '../../adapters/storage/learning';

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function LearningSnapshotPanel() {
  const snapshot = getLearningSnapshot();
  const { adoption, attention, tasks } = snapshot.report;

  return (
    <section
      aria-label="Learning snapshot"
      className="mb-6 rounded-md border border-stone-200 bg-white p-5"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
            <Activity aria-hidden="true" size={16} />
            Attention trend
          </p>
          <p className="mt-2 font-semibold text-2xl text-stone-950">
            {formatPercent(attention.averageScore)}
          </p>
          <p className="mt-1 text-sm text-stone-500">{attention.dominantState ?? 'unknown'}</p>
        </div>
        <div>
          <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
            <CheckCircle2 aria-hidden="true" size={16} />
            Completion
          </p>
          <p className="mt-2 font-semibold text-2xl text-stone-950">
            {formatPercent(tasks.completionRatio)}
          </p>
          <p className="mt-1 text-sm text-stone-500">{tasks.completedTasks} done</p>
        </div>
        <div>
          <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
            <Lightbulb aria-hidden="true" size={16} />
            AI adoption
          </p>
          <p className="mt-2 font-semibold text-2xl text-stone-950">
            {formatPercent(adoption.adoptionRate)}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {snapshot.pendingOptimizationCount} pending optimization
          </p>
        </div>
      </div>
    </section>
  );
}
