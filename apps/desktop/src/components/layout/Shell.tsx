import { Focus, ListTree, Sparkles } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { useDailyFlow } from '../../hooks/useDailyFlow';
import { useRouteSync } from '../../hooks/useRouteSync';

const workflowStages = [
  {
    to: '/ritual',
    label: 'Ritual',
    description: 'Settle attention before work',
    icon: Sparkles,
  },
  {
    to: '/overview',
    label: 'Overview',
    description: 'Read-only workflow scan',
    icon: ListTree,
  },
  {
    to: '/execution/plan',
    match: '/execution',
    label: 'Execution',
    description: 'Plan and focus on action',
    icon: Focus,
  },
] as const;

export function Shell() {
  const dailyFlow = useDailyFlow();
  const location = useLocation();
  useRouteSync(dailyFlow);

  function isStageActive(stage: (typeof workflowStages)[number]) {
    if ('match' in stage) {
      return location.pathname.startsWith(stage.match);
    }

    return location.pathname === stage.to;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <div className="min-h-screen md:grid md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-stone-200 border-r bg-white md:block">
          <div className="flex h-full flex-col gap-8 px-5 py-6">
            <div>
              <p className="font-semibold text-emerald-700 text-sm">AttentionOS V2</p>
              <p className="mt-2 text-stone-500 text-sm">Personal Attention OS</p>
            </div>

            <nav aria-label="Workflow stages" className="flex flex-col gap-2">
              {workflowStages.map((stage) => {
                const Icon = stage.icon;

                return (
                  <NavLink
                    className={() =>
                      [
                        'group flex items-start gap-3 rounded-md border px-3 py-3 transition-colors',
                        isStageActive(stage)
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                          : 'border-transparent text-stone-600 hover:border-stone-200 hover:bg-stone-100',
                      ].join(' ')
                    }
                    key={stage.to}
                    to={stage.to}
                  >
                    <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-medium text-sm">{stage.label}</span>
                      <span className="mt-1 block text-xs text-stone-500 leading-4">
                        {stage.description}
                      </span>
                    </span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-auto border-stone-200 border-t pt-5 text-stone-500 text-xs leading-5">
              Keep attention human-led. Review suggestions before they change your workflow.
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 pb-24 sm:px-6 md:px-8 md:py-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Workflow stages"
        className="fixed inset-x-0 bottom-0 z-20 border-stone-200 border-t bg-white/95 px-2 py-2 shadow-[0_-10px_30px_rgba(28,25,23,0.08)] backdrop-blur md:hidden"
      >
        <div className="grid grid-cols-3 gap-1">
          {workflowStages.map((stage) => {
            const Icon = stage.icon;

            return (
              <NavLink
                className={() =>
                  [
                    'flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 text-center transition-colors',
                    isStageActive(stage)
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900',
                  ].join(' ')
                }
                key={stage.to}
                to={stage.to}
              >
                <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className="font-medium text-[11px] leading-4">{stage.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
