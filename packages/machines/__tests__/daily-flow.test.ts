import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { dailyFlowMachine } from '../src/daily-flow';

function makeActor() {
  return createActor(dailyFlowMachine);
}

describe('dailyFlowMachine — initial state', () => {
  it('starts in ritual stage', () => {
    const actor = makeActor();
    actor.start();
    expect(actor.getSnapshot().value).toMatchObject({ ritual: 'meditation' });
    actor.stop();
  });
});

describe('dailyFlowMachine — ritual substates', () => {
  it('meditation → reflection on MEDITATION_COMPLETE', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'MEDITATION_COMPLETE' });
    expect(actor.getSnapshot().value).toMatchObject({ ritual: 'reflection' });
    actor.stop();
  });

  it('reflection → dedication on REFLECTION_SAVED', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'MEDITATION_COMPLETE' });
    actor.send({ type: 'REFLECTION_SAVED', text: 'Today I will focus.' });
    expect(actor.getSnapshot().value).toMatchObject({ ritual: 'dedication' });
    actor.stop();
  });

  it('dedication → overview on RITUAL_COMPLETE', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'MEDITATION_COMPLETE' });
    actor.send({ type: 'REFLECTION_SAVED', text: 'Some reflection.' });
    actor.send({ type: 'RITUAL_COMPLETE' });
    expect(actor.getSnapshot().value).toBe('overview');
    actor.stop();
  });
});

describe('dailyFlowMachine — stage transitions', () => {
  function reachOverview() {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'MEDITATION_COMPLETE' });
    actor.send({ type: 'REFLECTION_SAVED', text: 'x' });
    actor.send({ type: 'RITUAL_COMPLETE' });
    return actor;
  }

  it('overview → execution on START_EXECUTION', () => {
    const actor = reachOverview();
    actor.send({ type: 'START_EXECUTION', taskId: 'task-001' });
    expect(actor.getSnapshot().value).toBe('execution');
    actor.stop();
  });

  it('execution → overview on BACK_TO_OVERVIEW', () => {
    const actor = reachOverview();
    actor.send({ type: 'START_EXECUTION', taskId: 'task-001' });
    actor.send({ type: 'BACK_TO_OVERVIEW' });
    expect(actor.getSnapshot().value).toBe('overview');
    actor.stop();
  });

  it('execution → ritual on START_NEW_RITUAL', () => {
    const actor = reachOverview();
    actor.send({ type: 'START_EXECUTION', taskId: 'task-001' });
    actor.send({ type: 'START_NEW_RITUAL' });
    expect(actor.getSnapshot().value).toMatchObject({ ritual: 'meditation' });
    actor.stop();
  });

  it('overview → ritual on START_NEW_RITUAL', () => {
    const actor = reachOverview();
    actor.send({ type: 'START_NEW_RITUAL' });
    expect(actor.getSnapshot().value).toMatchObject({ ritual: 'meditation' });
    actor.stop();
  });

  it('restores a persisted workflow stage', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'RESTORE_STAGE', stage: 'execution' });
    expect(actor.getSnapshot().value).toBe('execution');
    actor.send({ type: 'RESTORE_STAGE', stage: 'overview' });
    expect(actor.getSnapshot().value).toBe('overview');
    actor.send({ type: 'RESTORE_STAGE', stage: 'ritual' });
    expect(actor.getSnapshot().value).toMatchObject({ ritual: 'meditation' });
    actor.stop();
  });
});

describe('dailyFlowMachine — invalid transitions are ignored', () => {
  it('ritual stage ignores START_EXECUTION', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START_EXECUTION', taskId: 'task-001' });
    // Must still be in ritual
    const val = actor.getSnapshot().value;
    expect(JSON.stringify(val)).toContain('ritual');
    actor.stop();
  });

  it('overview stage ignores MEDITATION_COMPLETE', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'MEDITATION_COMPLETE' });
    actor.send({ type: 'REFLECTION_SAVED', text: 'x' });
    actor.send({ type: 'RITUAL_COMPLETE' });
    actor.send({ type: 'MEDITATION_COMPLETE' }); // should be ignored
    expect(actor.getSnapshot().value).toBe('overview');
    actor.stop();
  });
});

describe('dailyFlowMachine — context', () => {
  it('stores reflection text in context', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'MEDITATION_COMPLETE' });
    actor.send({ type: 'REFLECTION_SAVED', text: 'Focus on delivery.' });
    expect(actor.getSnapshot().context.reflectionText).toBe('Focus on delivery.');
    actor.stop();
  });

  it('stores active task id when entering execution', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'MEDITATION_COMPLETE' });
    actor.send({ type: 'REFLECTION_SAVED', text: 'x' });
    actor.send({ type: 'RITUAL_COMPLETE' });
    actor.send({ type: 'START_EXECUTION', taskId: 'task-42' });
    expect(actor.getSnapshot().context.activeTaskId).toBe('task-42');
    actor.stop();
  });

  it('context does not contain task details (no circular dependency risk)', () => {
    const actor = makeActor();
    actor.start();
    const ctx = actor.getSnapshot().context;
    // context should only have metadata, not full task objects
    expect(ctx).not.toHaveProperty('task');
    expect(ctx).not.toHaveProperty('tasks');
    actor.stop();
  });
});
