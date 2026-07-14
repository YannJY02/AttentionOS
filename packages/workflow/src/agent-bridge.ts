import type { V2WorkflowStage } from './types';

export type AgentDailyFlowEvent =
  | { readonly type: 'START_EXECUTION'; readonly taskId: string }
  | { readonly type: 'BACK_TO_OVERVIEW' }
  | { readonly type: 'START_NEW_RITUAL' };

export function isAgentDailyFlowEventAllowed(
  stage: V2WorkflowStage,
  event: AgentDailyFlowEvent,
): boolean {
  if (stage === 'overview') {
    return event.type === 'START_EXECUTION' || event.type === 'START_NEW_RITUAL';
  }

  if (stage === 'execution') {
    return event.type === 'BACK_TO_OVERVIEW' || event.type === 'START_NEW_RITUAL';
  }

  return false;
}
