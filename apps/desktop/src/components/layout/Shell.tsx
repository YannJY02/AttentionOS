import { Focus, ListTree, Sparkles } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
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
    to: '/execution',
    label: 'Execution',
    description: 'Plan and focus on action',
    icon: Focus,
  },
] as const;

export function Shell() {
  const dailyFlow = useDailyFlow();
  useRouteSync(dailyFlow);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <div className="grid min-h-screen grid-cols-[280px_1fr]">
        <aside className="border-stone-200 border-r bg-white">
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
                    className={({ isActive }) =>
                      [
                        'group flex items-start gap-3 rounded-md border px-3 py-3 transition-colors',
                        isActive
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                          : 'border-transparent text-stone-600 hover:border-stone-200 hover:bg-stone-100',
                      ].join(' ')
                    }
                    end
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
              Deterministic core first. AI remains out of Phase 1.
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
