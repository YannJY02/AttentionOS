import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { executionModeMachine, hasExecutionFocusTarget } from '../src/execution-mode';

describe('executionModeMachine', () => {
  it('starts in plan mode', () => {
    const actor = createActor(executionModeMachine).start();

    expect(actor.getSnapshot().value).toBe('plan');
    expect(actor.getSnapshot().context.activeTaskId).toBeNull();
  });

  it('enters focus only when a focus target exists', () => {
    const actor = createActor(executionModeMachine).start();

    actor.send({ type: 'REQUEST_FOCUS', taskId: null });
    expect(actor.getSnapshot().value).toBe('plan');

    actor.send({ type: 'REQUEST_FOCUS', taskId: 'task-1' });
    expect(actor.getSnapshot().value).toBe('focus');
    expect(actor.getSnapshot().context.activeTaskId).toBe('task-1');
  });

  it('rejects direct focus route restoration without an active task', () => {
    const actor = createActor(executionModeMachine).start();

    actor.send({ type: 'RESTORE_MODE', mode: 'focus', taskId: null });

    expect(actor.getSnapshot().value).toBe('plan');
  });

  it('returns from focus to plan without completing the task', () => {
    const actor = createActor(executionModeMachine).start();

    actor.send({ type: 'REQUEST_FOCUS', taskId: 'task-1' });
    actor.send({ type: 'EXIT_FOCUS' });

    expect(actor.getSnapshot().value).toBe('plan');
    expect(actor.getSnapshot().context.activeTaskId).toBe('task-1');
  });

  it('clears the focus target when focus completes', () => {
    const actor = createActor(executionModeMachine).start();

    actor.send({ type: 'REQUEST_FOCUS', taskId: 'task-1' });
    actor.send({ type: 'COMPLETE_FOCUS' });

    expect(actor.getSnapshot().value).toBe('plan');
    expect(actor.getSnapshot().context.activeTaskId).toBeNull();
  });

  it('validates usable focus target identifiers', () => {
    expect(hasExecutionFocusTarget('task-1')).toBe(true);
    expect(hasExecutionFocusTarget('   ')).toBe(false);
    expect(hasExecutionFocusTarget(null)).toBe(false);
  });
});
