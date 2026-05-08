export function RitualPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="font-medium text-amber-700 text-sm">Stage 1</p>
        <h1 className="mt-2 font-semibold text-4xl text-stone-950">Ritual</h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600">
          Morning and evening practice starts here: prayer, meditation, reflection, and dedication
          before the day moves into planning.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-stone-200 bg-white p-5">
          <p className="font-medium text-stone-950">Prayer</p>
          <p className="mt-2 text-sm text-stone-600">Show the configured text before action.</p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-5">
          <p className="font-medium text-stone-950">Meditation</p>
          <p className="mt-2 text-sm text-stone-600">Prepare timer settings and enter practice.</p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-5">
          <p className="font-medium text-stone-950">Dedication</p>
          <p className="mt-2 text-sm text-stone-600">Capture meaningful events for follow-up.</p>
        </div>
      </div>
    </section>
  );
}
