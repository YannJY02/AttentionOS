import { AlertTriangle, Save, XCircle } from 'lucide-react';
import { useState } from 'react';
import {
  clearReflectionRecoveryIssue,
  type RitualFollowUpTarget,
  readReflectionRecoveryIssue,
  readReflections,
} from '../../storage/reflections';

interface ReflectionStepProps {
  readonly onSave: (text: string, followUpTargets: readonly RitualFollowUpTarget[]) => void;
}

export function ReflectionStep({ onSave }: ReflectionStepProps) {
  const [text, setText] = useState('');
  const [followUpTargets, setFollowUpTargets] = useState<readonly RitualFollowUpTarget[]>([]);
  const [recoveryIssue, setRecoveryIssue] = useState(() => {
    readReflections();
    return readReflectionRecoveryIssue();
  });
  const trimmedText = text.trim();

  function toggleFollowUpTarget(target: RitualFollowUpTarget) {
    setFollowUpTargets((current) =>
      current.includes(target)
        ? current.filter((currentTarget) => currentTarget !== target)
        : [...current, target],
    );
  }

  function clearRecoveryIssue() {
    clearReflectionRecoveryIssue();
    setRecoveryIssue(null);
  }

  return (
    <section className="max-w-2xl">
      <p className="font-medium text-amber-700 text-sm">Ritual step 2</p>
      <h1 className="mt-2 font-semibold text-4xl text-stone-950">Reflection</h1>
      <p className="mt-3 text-base text-stone-600">
        Capture the starting condition for this work session before moving into dedication.
      </p>

      <div className="mt-8 rounded-md border border-stone-200 bg-white p-6">
        {recoveryIssue ? (
          <div className="mb-5 rounded-md border border-amber-300 bg-amber-50 p-4" role="alert">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 font-medium text-amber-800 text-sm">
                  <AlertTriangle aria-hidden="true" size={16} />
                  Reflection recovery
                </p>
                <h2 className="mt-1 font-semibold text-amber-950 text-lg">
                  Reflection storage was recovered
                </h2>
                <p className="mt-1 text-amber-900 text-sm">
                  A malformed reflection payload was preserved before this Ritual continued.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-amber-300 px-3 py-2 font-medium text-amber-950 text-sm"
                onClick={clearRecoveryIssue}
                type="button"
              >
                <XCircle aria-hidden="true" size={16} />
                Clear warning
              </button>
            </div>
            <dl className="mt-3 grid gap-2 text-amber-950 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium">Original size</dt>
                <dd>{recoveryIssue.originalBytes} bytes</dd>
              </div>
              <div>
                <dt className="font-medium">Reason</dt>
                <dd>{recoveryIssue.message}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <label className="font-medium text-sm text-stone-800" htmlFor="ritual-reflection">
          Reflection
        </label>
        <textarea
          aria-describedby="ritual-reflection-status"
          className="mt-3 min-h-36 w-full resize-y rounded-md border border-stone-300 bg-white p-3 text-sm text-stone-900 outline-none focus:border-amber-700"
          id="ritual-reflection"
          onChange={(event) => setText(event.target.value)}
          value={text}
        />
        <p className="mt-2 text-sm text-stone-500" id="ritual-reflection-status" role="status">
          {trimmedText
            ? 'Reflection is ready to save.'
            : 'Reflection is empty; dedication unlocks after a note is saved.'}
        </p>

        <fieldset className="mt-4 grid gap-2">
          <legend className="font-medium text-sm text-stone-800">Carry forward</legend>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              checked={followUpTargets.includes('task')}
              className="h-4 w-4 rounded border-stone-300 text-amber-700"
              onChange={() => toggleFollowUpTarget('task')}
              type="checkbox"
            />
            Use as task input
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              checked={followUpTargets.includes('project')}
              className="h-4 w-4 rounded border-stone-300 text-amber-700"
              onChange={() => toggleFollowUpTarget('project')}
              type="checkbox"
            />
            Use as project input
          </label>
        </fieldset>

        <button
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2 font-medium text-sm text-white disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={!trimmedText}
          onClick={() => onSave(trimmedText, followUpTargets)}
          type="button"
        >
          <Save aria-hidden="true" size={16} />
          Save reflection
        </button>
      </div>
    </section>
  );
}
