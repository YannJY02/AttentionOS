export function OverviewPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="font-medium text-emerald-700 text-sm">Stage 2</p>
        <h1 className="mt-2 font-semibold text-4xl text-stone-950">Overview</h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600">
          A read-only view for scanning the current workflow layer before switching into execution.
          Editing and decomposition belong in the execution stage.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-stone-200 bg-white p-5">
          <p className="font-medium text-stone-950">Current Layer</p>
          <p className="mt-2 text-sm text-stone-600">
            Start from vision, area, goal, project, or task without mixing levels.
          </p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-5">
          <p className="font-medium text-stone-950">Bridge to Action</p>
          <p className="mt-2 text-sm text-stone-600">
            Move to execution(plan) when the next planning action is clear.
          </p>
        </div>
      </div>
    </section>
  );
}
