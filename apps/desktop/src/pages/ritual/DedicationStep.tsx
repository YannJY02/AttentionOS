import { CheckCircle2 } from 'lucide-react';

interface DedicationStepProps {
  readonly onComplete: () => void;
  readonly reflectionText: string;
}

export function DedicationStep({ onComplete, reflectionText }: DedicationStepProps) {
  return (
    <section className="max-w-2xl">
      <p className="font-medium text-amber-700 text-sm">Ritual step 3</p>
      <h1 className="mt-2 font-semibold text-4xl text-stone-950">Dedication</h1>
      <p className="mt-3 text-base text-stone-600">
        Close the ritual and move into overview when the reflection has been captured.
      </p>

      <div className="mt-8 rounded-md border border-stone-200 bg-white p-6">
        <p className="font-medium text-sm text-stone-800">Saved reflection</p>
        <p className="mt-3 rounded-md bg-stone-50 p-4 text-sm text-stone-700">{reflectionText}</p>

        <button
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber-700 px-4 py-2 font-medium text-sm text-white"
          onClick={onComplete}
          type="button"
        >
          <CheckCircle2 aria-hidden="true" size={16} />
          Complete ritual
        </button>
      </div>
    </section>
  );
}
