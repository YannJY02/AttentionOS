import { Plug, ShieldCheck } from 'lucide-react';

export function IntegrationBoundaryPanel() {
  return (
    <section
      aria-label="Integration boundary"
      className="mt-5 rounded-md border border-stone-200 bg-white p-5"
    >
      <div className="max-w-3xl">
        <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
          <Plug aria-hidden="true" size={16} />
          Integration boundary
        </p>
        <h2 className="mt-2 font-semibold text-2xl text-stone-950">
          Plugin/API integrations stay explicit
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          This release candidate does not monitor apps, screens, messages, browser activity, or
          calendar data in the background. Capture is manual, and future integrations must be
          reviewed as plugin, API, or auto-open capabilities before they can read or write outside
          the local workspace.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <article className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
          <p className="inline-flex items-center gap-2 font-medium text-sm">
            <ShieldCheck aria-hidden="true" size={16} />
            Current build
          </p>
          <p className="mt-2 text-sm">
            Manual Capture, local snapshots, and human-reviewed AI suggestions only.
          </p>
        </article>
        <article className="rounded-md border border-stone-200 bg-stone-50 p-4 text-stone-800">
          <p className="font-medium text-sm">Future plugins</p>
          <p className="mt-2 text-sm">
            Must declare source, sensor, intervention, or executor permissions before use.
          </p>
        </article>
        <article className="rounded-md border border-stone-200 bg-stone-50 p-4 text-stone-800">
          <p className="font-medium text-sm">Future API or auto-open</p>
          <p className="mt-2 text-sm">
            Must stay scoped, user-approved, and auditable before touching external apps.
          </p>
        </article>
      </div>
    </section>
  );
}
