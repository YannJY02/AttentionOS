export function ExecutionPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="font-medium text-sky-700 text-sm">Stage 3</p>
        <h1 className="mt-2 font-semibold text-4xl text-stone-950">Execution</h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600">
          The active work stage for planning, focus, review, and completion. This is where editable
          task and project workflows will connect to the XState machines.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-stone-200 bg-white p-5">
          <p className="font-medium text-stone-950">Plan Mode</p>
          <p className="mt-2 text-sm text-stone-600">
            Create, decompose, and order the next concrete action.
          </p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-5">
          <p className="font-medium text-stone-950">Focus Mode</p>
          <p className="mt-2 text-sm text-stone-600">
            Keep exactly one active action in front of the user.
          </p>
        </div>
      </div>
    </section>
  );
}
