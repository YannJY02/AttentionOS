import type { AttentionState, ReportedForegroundCategory } from '@attentionos/guidance';
import { Gauge, Save } from 'lucide-react';
import { useState } from 'react';
import {
  getLatestAttentionObservation,
  recordAttentionCalibration,
} from '../../adapters/storage/learning';

const ATTENTION_STATES: readonly AttentionState[] = [
  'focused',
  'drifting',
  'overloaded',
  'fatigued',
];

const FOREGROUND_CATEGORIES: readonly ReportedForegroundCategory[] = [
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
    appSwitchesLast15Min: '',
    clarity: '',
    correctedState: '',
    distractibility: '',
    energy: '',
    foregroundCategory: '' as ReportedForegroundCategory | '',
    fragmentedSessionCount: '',
    inhibitionErrorRate: '',
    reactionTimeMs: '',
  });
  const [latest, setLatest] = useState(() => getLatestAttentionObservation());
  const [status, setStatus] = useState(
    'Enter each calibration field yourself. AttentionOS does not monitor apps in the background.',
  );
  const isComplete =
    form.appSwitchesLast15Min !== '' &&
    form.clarity !== '' &&
    form.distractibility !== '' &&
    form.energy !== '' &&
    form.foregroundCategory !== '' &&
    form.fragmentedSessionCount !== '' &&
    form.inhibitionErrorRate !== '' &&
    form.reactionTimeMs !== '';

  function saveCalibration() {
    if (!isComplete || form.foregroundCategory === '') {
      setStatus('Enter each calibration field before saving an attention observation.');
      return;
    }

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
            This writes a local observation only after you enter every rating and behavior measure.
            It does not enable background sensing.
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
          App switches you recall in the last 15 min
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
          Fragmented sessions you noticed
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
          Current context you select
          <select
            className="mt-2 w-full rounded-md border border-stone-300 p-2 font-normal text-sm"
            id="attention-category"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                foregroundCategory: event.target.value as ReportedForegroundCategory,
              }))
            }
            value={form.foregroundCategory}
          >
            <option value="">Select a context</option>
            {FOREGROUND_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-medium text-sm text-stone-800" htmlFor="attention-reaction">
          Reaction time you enter (ms)
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
          Inhibition error rate you enter
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
          className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2 font-medium text-sm text-white disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={!isComplete}
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
