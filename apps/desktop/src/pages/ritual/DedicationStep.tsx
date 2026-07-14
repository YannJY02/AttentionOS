import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import type { RitualFollowUpTarget } from '../../adapters/storage/reflections';

interface DedicationStepProps {
  readonly dedicationText: string;
  readonly onComplete: (followUpTargets: readonly RitualFollowUpTarget[]) => void;
  readonly reflectionText: string;
}

export function DedicationStep({
  dedicationText,
  onComplete,
  reflectionText,
}: DedicationStepProps) {
  const [followUpTargets, setFollowUpTargets] = useState<readonly RitualFollowUpTarget[]>([]);

  function toggleFollowUpTarget(target: RitualFollowUpTarget) {
    setFollowUpTargets((current) =>
      current.includes(target)
        ? current.filter((currentTarget) => currentTarget !== target)
        : [...current, target],
    );
  }

  return (
    <section className="max-w-2xl">
      <p className="font-medium text-amber-700 text-sm">Ritual step 3</p>
      <h1 className="mt-2 font-semibold text-4xl text-stone-950">Dedication</h1>
      <p className="mt-3 text-base text-stone-600">{dedicationText}</p>

      <div className="mt-8 rounded-md border border-stone-200 bg-white p-6">
        <p className="font-medium text-sm text-stone-800">Saved reflection</p>
        <p className="mt-3 rounded-md bg-stone-50 p-4 text-sm text-stone-700">{reflectionText}</p>

        <fieldset className="mt-5 grid gap-2">
          <legend className="font-medium text-sm text-stone-800">Carry dedication forward</legend>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              checked={followUpTargets.includes('task')}
              className="h-4 w-4 rounded border-stone-300 text-amber-700"
              onChange={() => toggleFollowUpTarget('task')}
              type="checkbox"
            />
            Use dedication as task input
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              checked={followUpTargets.includes('project')}
              className="h-4 w-4 rounded border-stone-300 text-amber-700"
              onChange={() => toggleFollowUpTarget('project')}
              type="checkbox"
            />
            Use dedication as project input
          </label>
        </fieldset>

        <button
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber-700 px-4 py-2 font-medium text-sm text-white"
          onClick={() => onComplete(followUpTargets)}
          type="button"
        >
          <CheckCircle2 aria-hidden="true" size={16} />
          Complete ritual
        </button>
      </div>
    </section>
  );
}
