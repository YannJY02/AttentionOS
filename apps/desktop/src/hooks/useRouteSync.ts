import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { DailyFlowApi, WorkflowStage } from './useDailyFlow';

const ROUTE_STAGES: ReadonlySet<WorkflowStage> = new Set(['ritual', 'overview', 'execution']);

function routeForStage(stage: WorkflowStage): string {
  return stage === 'execution' ? '/execution/plan' : `/${stage}`;
}

function stageFromPathname(pathname: string): WorkflowStage | null {
  const segment = pathname.split('/').filter(Boolean)[0];

  if (ROUTE_STAGES.has(segment as WorkflowStage)) {
    return segment as WorkflowStage;
  }

  return null;
}

export function useRouteSync(dailyFlow: DailyFlowApi): void {
  const location = useLocation();
  const navigate = useNavigate();
  const previousPath = useRef<string | null>(null);
  const previousStage = useRef<WorkflowStage | null>(null);

  useEffect(() => {
    const routeStage = stageFromPathname(location.pathname);
    const pathChanged = previousPath.current !== location.pathname;
    const stageChanged = previousStage.current !== dailyFlow.stage;

    if (pathChanged && routeStage && routeStage !== dailyFlow.stage) {
      dailyFlow.send({ type: 'RESTORE_STAGE', stage: routeStage });
    } else if (stageChanged && routeStage !== dailyFlow.stage) {
      navigate(routeForStage(dailyFlow.stage), { replace: true });
    }

    previousPath.current = location.pathname;
    previousStage.current = dailyFlow.stage;
  }, [dailyFlow, location.pathname, navigate]);
}
