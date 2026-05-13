import type { V2Entity } from '@attentionos/core';
import { CalendarDays, Flag, Milestone, Route } from 'lucide-react';

interface VisionMilestone {
  readonly label: string;
  readonly timeframe: string;
  readonly status: string;
  readonly description: string;
}

interface VisionOverviewPanelProps {
  readonly entity: V2Entity | null;
  readonly onOpen: (entity: V2Entity) => void;
}

function asText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function isMilestone(value: unknown): value is VisionMilestone {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const milestone = value as Record<string, unknown>;
  return (
    typeof milestone.label === 'string' &&
    typeof milestone.timeframe === 'string' &&
    typeof milestone.status === 'string' &&
    typeof milestone.description === 'string'
  );
}

function readMilestones(entity: V2Entity | null): readonly VisionMilestone[] {
  const rawMilestones = entity?.properties.milestones;
  if (!Array.isArray(rawMilestones)) {
    return [];
  }

  return rawMilestones.filter(isMilestone);
}

export function VisionOverviewPanel({ entity, onOpen }: VisionOverviewPanelProps) {
  const horizon = asText(entity?.properties.horizon, 'Long-horizon direction');
  const cadence = asText(entity?.properties.reflectionCadence, 'Set a regular direction check');
  const checkpoint = asText(
    entity?.properties.nextCheckpoint,
    'Choose the next area or goal that deserves execution attention.',
  );
  const milestones = readMilestones(entity);

  return (
    <section
      aria-label="Vision timeline"
      className="mb-6 rounded-md border border-stone-200 bg-white p-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 font-medium text-emerald-700 text-sm">
            <Route aria-hidden="true" size={16} />
            Timeline-first vision scan
          </p>
          <h2 className="mt-3 font-semibold text-2xl text-stone-950">
            {entity?.title ?? 'Define the long-horizon direction'}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {entity?.content ??
              'Use this view to hold direction, milestones, and reflection rhythm before judging tasks.'}
          </p>
        </div>

        {entity ? (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800"
            onClick={() => onOpen(entity)}
            type="button"
          >
            Inspect branch
            <Milestone aria-hidden="true" size={16} />
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-md border border-stone-200 p-4">
          <p className="inline-flex items-center gap-2 font-medium text-stone-500 text-sm">
            <Flag aria-hidden="true" size={16} />
            Direction served
          </p>
          <p className="mt-2 font-medium text-stone-950">{horizon}</p>
          <p className="mt-4 inline-flex items-center gap-2 font-medium text-stone-500 text-sm">
            <CalendarDays aria-hidden="true" size={16} />
            Reflection cadence
          </p>
          <p className="mt-2 text-sm text-stone-700">{cadence}</p>
          <p className="mt-4 text-sm text-stone-500">Next checkpoint</p>
          <p className="mt-1 text-sm text-stone-700">{checkpoint}</p>
        </div>

        <ol className="relative space-y-4 border-stone-200 border-l pl-5">
          {milestones.length > 0 ? (
            milestones.map((milestone) => (
              <li key={`${milestone.timeframe}-${milestone.label}`} className="relative">
                <span className="-left-[1.68rem] absolute mt-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-600" />
                <p className="font-medium text-stone-950">{milestone.label}</p>
                <p className="mt-1 text-stone-500 text-xs uppercase">
                  {milestone.timeframe} · {milestone.status}
                </p>
                <p className="mt-2 text-sm text-stone-600">{milestone.description}</p>
              </li>
            ))
          ) : (
            <li className="relative">
              <span className="-left-[1.68rem] absolute mt-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-600" />
              <p className="font-medium text-stone-950">First direction checkpoint</p>
              <p className="mt-2 text-sm text-stone-600">
                Capture the next meaningful area before comparing metrics or tasks.
              </p>
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}
