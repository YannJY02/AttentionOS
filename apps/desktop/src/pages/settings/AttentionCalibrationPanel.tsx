import type { AttentionState, PassiveForegroundCategory } from '@attentionos/core';
import { Gauge, Save } from 'lucide-react';
import { useState } from 'react';
import { getLatestAttentionObservation, recordAttentionCalibration } from '../../storage/learning';

const ATTENTION_STATES: readonly AttentionState[] = [
  'focused',
  'drifting',
  'overloaded',
  'fatigued',
];

const FOREGROUND_CATEGORIES: readonly PassiveForegroundCategory[] = [
  'work',
  'communication',
  'social',
  'learning',
  'other',
];

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function AttentionCalibrationPanel() {
  const [form, setForm] = useState({
    appSwitchesLast15Min: '2',
    clarity: '4',
    correctedState: '',
    distractibility: '3',
    energy: '3',
    foregroundCategory: 'work' as PassiveForegroundCategory,
    fragmentedSessionCount: '1',
    inhibitionErrorRate: '0.05',
    reactionTimeMs: '650',
    selfReportedDifficulty: '2',
    stress: '3',
    trialCount: '8',
  });
  const [latest, setLatest] = useState(() => getLatestAttentionObservation());
  const [status, setStatus] = useState(
    'Manual calibration combines self-report and behavior signals without passive monitoring.',
  );

  function saveCalibration() {
    const result = recordAttentionCalibration({
      appSwitchesLast15Min: Number(form.appSwitchesLast15Min),
      clarity: Number(form.clarity),
      correctedState: form.correctedState ? (form.correctedState as AttentionState) : undefined,
      distractibility: Number(form.distractibility),
      energy: Number(form.energy),
      foregroundCategory: form.foregroundCategory,
      fragmentedSessionCount: Number(form.fragmentedSessionCount),
      inhibitionErrorRate: Number(form.inhibitionErrorRate),
      reactionTimeMs: Number(form.reactionTimeMs),
      selfReportedDifficulty: Number(form.selfReportedDifficulty),
      stress: Number(form.stress),
      trialCount: Number(form.trialCount),
    });

    setLatest(result.observation);
    setStatus(
      result.correctedFrom
        ? `Attention calibration saved as ${result.observation.state}; corrected from ${result.correctedFrom}.`
        : `Attention calibration saved as ${result.observation.state} with ${percent(result.observation.confidence)} confidence.`,
    );
  }

  return (
    <section className="mt-5 rounded-md border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
            <Gauge aria-hidden="true" size={16} />
            Attention calibration
          </p>
          <h2 className="mt-2 font-semibold text-2xl text-stone-950">
            Correct the local attention estimate
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            This writes a local observation from subjective ratings, manual behavior signals, and a
            tiny probe. It does not enable background sensing.
          </p>
        </div>
        {latest ? (
          <p className="rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-600">
            Latest: {latest.state}; {percent(latest.confidence)}
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="block font-medium text-sm text-stone-800" htmlFor="attention-clarity">
          Clarity
          <input
            className="mt-2 w-full rounded-md border border-stone-300 p-2 font-normal text-sm"
            id="attention-clarity"
            max="5"
            min="1"
            onChange={(event) =>
              setForm((current) => ({ ...current, clarity: event.target.value }))
            }
            type="number"
            value={form.clarity}
          />
        </label>
        <label className="block font-medium text-sm text-stone-800" htmlFor="attention-energy">
          Energy
          <input
            className="mt-2 w-full rounded-md border border-stone-300 p-2 font-normal text-sm"
            id="attention-energy"
            max="5"
            min="1"
            onChange={(event) => setForm((current) => ({ ...current, energy: event.target.value }))}
            type="number"
            value={form.energy}
          />
        </label>
        <label
          className="block font-medium text-sm text-stone-800"
          htmlFor="attention-distractibility"
        >
          Distractibility
          <input
            className="mt-2 w-full rounded-md border border-stone-300 p-2 font-normal text-sm"
            id="attention-distractibility"
            max="5"
            min="1"
            onChange={(event) =>
              setForm((current) => ({ ...current, distractibility: event.target.value }))
            }
            type="number"
            value={form.distractibility}
          />
        </label>
        <label className="block font-medium text-sm text-stone-800" htmlFor="attention-switches">
          App switches last 15 min
          <input
            className="mt-2 w-full rounded-md border border-stone-300 p-2 font-normal text-sm"
            id="attention-switches"
            min="0"
            onChange={(event) =>
              setForm((current) => ({ ...current, appSwitchesLast15Min: event.target.value }))
            }
            type="number"
            value={form.appSwitchesLast15Min}
          />
        </label>
        <label className="block font-medium text-sm text-stone-800" htmlFor="attention-fragments">
          Fragmented sessions
          <input
            className="mt-2 w-full rounded-md border border-stone-300 p-2 font-normal text-sm"
            id="attention-fragments"
            min="0"
            onChange={(event) =>
              setForm((current) => ({ ...current, fragmentedSessionCount: event.target.value }))
            }
            type="number"
            value={form.fragmentedSessionCount}
          />
        </label>
        <label className="block font-medium text-sm text-stone-800" htmlFor="attention-category">
          Current context
          <select
            className="mt-2 w-full rounded-md border border-stone-300 p-2 font-normal text-sm"
            id="attention-category"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                foregroundCategory: event.target.value as PassiveForegroundCategory,
              }))
            }
            value={form.foregroundCategory}
          >
            {FOREGROUND_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-medium text-sm text-stone-800" htmlFor="attention-reaction">
          Probe reaction time ms
          <input
            className="mt-2 w-full rounded-md border border-stone-300 p-2 font-normal text-sm"
            id="attention-reaction"
            min="0"
            onChange={(event) =>
              setForm((current) => ({ ...current, reactionTimeMs: event.target.value }))
            }
            type="number"
            value={form.reactionTimeMs}
          />
        </label>
        <label className="block font-medium text-sm text-stone-800" htmlFor="attention-inhibition">
          Probe inhibition error rate
          <input
            className="mt-2 w-full rounded-md border border-stone-300 p-2 font-normal text-sm"
            id="attention-inhibition"
            max="1"
            min="0"
            onChange={(event) =>
              setForm((current) => ({ ...current, inhibitionErrorRate: event.target.value }))
            }
            step="0.01"
            type="number"
            value={form.inhibitionErrorRate}
          />
        </label>
        <label className="block font-medium text-sm text-stone-800" htmlFor="attention-correction">
          Correction
          <select
            className="mt-2 w-full rounded-md border border-stone-300 p-2 font-normal text-sm"
            id="attention-correction"
            onChange={(event) =>
              setForm((current) => ({ ...current, correctedState: event.target.value }))
            }
            value={form.correctedState}
          >
            <option value="">Use estimate</option>
            {ATTENTION_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2 font-medium text-sm text-white"
          onClick={saveCalibration}
          type="button"
        >
          <Save aria-hidden="true" size={16} />
          Save attention calibration
        </button>
        <p aria-live="polite" className="text-sm text-stone-600">
          {status}
        </p>
      </div>
    </section>
  );
}
