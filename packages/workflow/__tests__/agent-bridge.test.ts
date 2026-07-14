import { describe, expect, it } from 'vitest';
import { isAgentDailyFlowEventAllowed } from '../src/agent-bridge';

describe('agent daily-flow bridge', () => {
  it('allows only legal deterministic transitions', () => {
    expect(
      isAgentDailyFlowEventAllowed('overview', { type: 'START_EXECUTION', taskId: 'task-1' }),
    ).toBe(true);
    expect(isAgentDailyFlowEventAllowed('execution', { type: 'BACK_TO_OVERVIEW' })).toBe(true);
  });

  it('blocks agent attempts to skip ritual directly into execution', () => {
    expect(
      isAgentDailyFlowEventAllowed('ritual', { type: 'START_EXECUTION', taskId: 'task-1' }),
    ).toBe(false);
  });
});
