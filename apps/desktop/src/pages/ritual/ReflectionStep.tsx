import { Save } from 'lucide-react';
import { useState } from 'react';

interface ReflectionStepProps {
  readonly onSave: (text: string) => void;
}

export function ReflectionStep({ onSave }: ReflectionStepProps) {
  const [text, setText] = useState('');
  const trimmedText = text.trim();

  return (
    <section className="max-w-2xl">
      <p className="font-medium text-amber-700 text-sm">Ritual step 2</p>
      <h1 className="mt-2 font-semibold text-4xl text-stone-950">Reflection</h1>
      <p className="mt-3 text-base text-stone-600">
        Capture the starting condition for this work session before moving into dedication.
      </p>

      <div className="mt-8 rounded-md border border-stone-200 bg-white p-6">
        <label className="font-medium text-sm text-stone-800" htmlFor="ritual-reflection">
          Reflection
        </label>
        <textarea
          className="mt-3 min-h-36 w-full resize-y rounded-md border border-stone-300 bg-white p-3 text-sm text-stone-900 outline-none focus:border-amber-700"
          id="ritual-reflection"
          onChange={(event) => setText(event.target.value)}
          value={text}
        />

        <button
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2 font-medium text-sm text-white disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={!trimmedText}
          onClick={() => onSave(trimmedText)}
          type="button"
        >
          <Save aria-hidden="true" size={16} />
          Save reflection
        </button>
      </div>
    </section>
  );
}
