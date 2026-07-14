import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { taskLifecycleMachine } from '../src/task-lifecycle';

function makeActor(taskId = 'task-001', title = 'Test task') {
  return createActor(taskLifecycleMachine, { input: { taskId, title, estimatedMinutes: 30 } });
}

describe('taskLifecycleMachine — initial state', () => {
  it('starts in planning state', () => {
    const actor = makeActor();
    actor.start();
    expect(actor.getSnapshot().value).toBe('planning');
    actor.stop();
  });

  it('context has correct initial values', () => {
    const actor = makeActor('t-42', 'My task');
    actor.start();
    const ctx = actor.getSnapshot().context;
    expect(ctx.taskId).toBe('t-42');
    expect(ctx.title).toBe('My task');
    expect(ctx.actualMinutes).toBe(0);
    actor.stop();
  });
});

describe('taskLifecycleMachine — happy path', () => {
  it('planning → executing on START_EXECUTION', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START_EXECUTION' });
    expect(actor.getSnapshot().value).toBe('executing');
    actor.stop();
  });

  it('executing → reviewing on SUBMIT_FOR_REVIEW', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START_EXECUTION' });
    actor.send({ type: 'SUBMIT_FOR_REVIEW' });
    expect(actor.getSnapshot().value).toBe('reviewing');
    actor.stop();
  });

  it('reviewing → done on COMPLETE', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START_EXECUTION' });
    actor.send({ type: 'SUBMIT_FOR_REVIEW' });
    actor.send({ type: 'COMPLETE' });
    expect(actor.getSnapshot().value).toBe('done');
    actor.stop();
  });
});

describe('taskLifecycleMachine — pause / resume', () => {
  it('executing → paused on PAUSE', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START_EXECUTION' });
    actor.send({ type: 'PAUSE' });
    expect(actor.getSnapshot().value).toBe('paused');
    actor.stop();
  });

  it('paused → executing on RESUME', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START_EXECUTION' });
    actor.send({ type: 'PAUSE' });
    actor.send({ type: 'RESUME' });
    expect(actor.getSnapshot().value).toBe('executing');
    actor.stop();
  });

  it('reviewing → paused on PAUSE', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START_EXECUTION' });
    actor.send({ type: 'SUBMIT_FOR_REVIEW' });
    actor.send({ type: 'PAUSE' });
    expect(actor.getSnapshot().value).toBe('paused');
    actor.stop();
  });
});

describe('taskLifecycleMachine — cancellation', () => {
  it('planning → cancelled on CANCEL', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('cancelled');
    actor.stop();
  });

  it('executing → cancelled on CANCEL', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START_EXECUTION' });
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('cancelled');
    actor.stop();
  });

  it('reviewing → cancelled on CANCEL', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START_EXECUTION' });
    actor.send({ type: 'SUBMIT_FOR_REVIEW' });
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('cancelled');
    actor.stop();
  });

  it('done is terminal — ignores CANCEL', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START_EXECUTION' });
    actor.send({ type: 'SUBMIT_FOR_REVIEW' });
    actor.send({ type: 'COMPLETE' });
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('done');
    actor.stop();
  });
});

describe('taskLifecycleMachine — time tracking', () => {
  it('TICK accumulates actualMinutes', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START_EXECUTION' });
    actor.send({ type: 'TICK', minutes: 10 });
    expect(actor.getSnapshot().context.actualMinutes).toBe(10);
    actor.stop();
  });

  it('TICK ignored when not executing', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'TICK', minutes: 5 }); // planning state
    expect(actor.getSnapshot().context.actualMinutes).toBe(0);
    actor.stop();
  });
});
