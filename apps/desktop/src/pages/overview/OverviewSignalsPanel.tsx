import type { HierarchyLayer } from '@attentionos/workflow';
import { AlertTriangle, GitBranch, Inbox, TrendingUp } from 'lucide-react';
import { getLearningSnapshot } from '../../storage/learning';
import { listRitualFollowUpInputs } from '../../storage/reflections';

interface OverviewSignalsPanelProps {
  readonly currentLayer: HierarchyLayer;
  readonly visibleEntityCount: number;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function riskLabel(snapshot: ReturnType<typeof getLearningSnapshot>): string {
  const { attention, tasks } = snapshot.report;

  if (
    attention.overloadedRatio >= 0.33 ||
    attention.averageScore < 0.6 ||
    tasks.oversizedActiveTaskCount > 0
  ) {
    return 'Elevated risk';
  }

  return 'Stable risk';
}

export function OverviewSignalsPanel({
  currentLayer,
  visibleEntityCount,
}: OverviewSignalsPanelProps) {
  const snapshot = getLearningSnapshot();
  const { attention, tasks } = snapshot.report;
  const markedRitualInputs = listRitualFollowUpInputs();
  const attentionSamples =
    attention.sampleCount > 0
      ? `${pluralize(attention.sampleCount, 'attention sample')} in the current window`
      : 'No attention samples yet';

  return (
    <section
      aria-label="Overview risks, trends, and context signals"
      className="mb-6 rounded-md border border-stone-200 bg-white p-5"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
            <AlertTriangle aria-hidden="true" size={16} />
            Risk
          </p>
          <h2 className="mt-2 font-semibold text-xl text-stone-950">{riskLabel(snapshot)}</h2>
          <p className="mt-2 text-sm text-stone-600">
            {formatPercent(attention.overloadedRatio)} overloaded or fatigued samples;{' '}
            {tasks.oversizedActiveTaskCount} oversized active tasks.
          </p>
        </div>

        <div>
          <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
            <TrendingUp aria-hidden="true" size={16} />
            Trend
          </p>
          <h2 className="mt-2 font-semibold text-xl text-stone-950">
            {formatPercent(attention.averageScore)} average attention
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {attentionSamples}; {formatPercent(attention.volatility)} volatility;{' '}
            {formatPercent(tasks.completionRatio)} completion.
          </p>
        </div>

        <div>
          <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
            <Inbox aria-hidden="true" size={16} />
            Context signals
          </p>
          <h2 className="mt-2 font-semibold text-xl text-stone-950">
            {pluralize(markedRitualInputs.length, 'marked Ritual input')}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {pluralize(visibleEntityCount, `${currentLayer} item`)} visible in this layer;{' '}
            {pluralize(snapshot.pendingOptimizationCount, 'pending AI optimization')}.
          </p>
        </div>
      </div>

      <p className="mt-4 inline-flex items-center gap-2 text-sm text-stone-500">
        <GitBranch aria-hidden="true" size={16} />
        These signals are read-only orientation for choosing the next execution bridge.
      </p>
    </section>
  );
}
