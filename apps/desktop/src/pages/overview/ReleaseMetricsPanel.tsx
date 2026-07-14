import { Gauge, ShieldCheck } from 'lucide-react';
import { getReleaseMetricsSnapshot, type ReleaseMetric } from '../../storage/releaseMetrics';

const STATUS_STYLES = {
  review: 'border-rose-200 bg-rose-50 text-rose-900',
  steady: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  watch: 'border-amber-200 bg-amber-50 text-amber-900',
} as const;

function MetricTile({ metric }: { readonly metric: ReleaseMetric }) {
  return (
    <article className="rounded-md border border-stone-200 bg-stone-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-sm text-stone-700">{metric.label}</h3>
        <span
          className={`rounded-md border px-2 py-1 font-medium text-[11px] uppercase tracking-normal ${STATUS_STYLES[metric.status]}`}
        >
          {metric.status}
        </span>
      </div>
      <p className="mt-2 font-semibold text-2xl text-stone-950">{metric.value}</p>
      <p className="mt-1 text-sm text-stone-600">{metric.detail}</p>
    </article>
  );
}

export function ReleaseMetricsPanel() {
  const snapshot = getReleaseMetricsSnapshot();

  return (
    <section
      aria-label="Release metrics and guardrails"
      className="mb-6 rounded-md border border-stone-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
            <Gauge aria-hidden="true" size={16} />
            Quantified workflow signals
          </p>
          <h2 className="mt-2 font-semibold text-2xl text-stone-950">
            Attention, recovery, and plan fulfillment
          </h2>
        </div>
        <p className="rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-600">
          {snapshot.generatedAt.slice(0, 10)}
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {snapshot.outcomeMetrics.map((metric) => (
          <MetricTile key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="mt-6 border-stone-200 border-t pt-5">
        <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
          <ShieldCheck aria-hidden="true" size={16} />
          Guardrail metrics
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {snapshot.guardrailMetrics.map((metric) => (
            <MetricTile key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}
