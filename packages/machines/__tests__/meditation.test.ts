import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { meditationMachine } from '../src/meditation';

function makeActor(durationMs = 300_000) {
  return createActor(meditationMachine, { input: { durationMs } });
}

describe('meditationMachine — initial state', () => {
  it('starts in idle state', () => {
    const actor = makeActor();
    actor.start();
    expect(actor.getSnapshot().value).toBe('idle');
    actor.stop();
  });

  it('idle context has zero elapsed', () => {
    const actor = makeActor();
    actor.start();
    expect(actor.getSnapshot().context.elapsedMs).toBe(0);
    actor.stop();
  });
});

describe('meditationMachine — start / pause / resume', () => {
  it('idle → meditating on START', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START' });
    expect(actor.getSnapshot().value).toBe('meditating');
    actor.stop();
  });

  it('meditating → paused on PAUSE', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'PAUSE' });
    expect(actor.getSnapshot().value).toBe('paused');
    actor.stop();
  });

  it('paused → meditating on RESUME', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'PAUSE' });
    actor.send({ type: 'RESUME' });
    expect(actor.getSnapshot().value).toBe('meditating');
    actor.stop();
  });
});

describe('meditationMachine — completion', () => {
  it('meditating → completed on COMPLETE', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'COMPLETE' });
    expect(actor.getSnapshot().value).toBe('completed');
    actor.stop();
  });

  it('paused → completed on COMPLETE', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'PAUSE' });
    actor.send({ type: 'COMPLETE' });
    expect(actor.getSnapshot().value).toBe('completed');
    actor.stop();
  });
});

describe('meditationMachine — TICK accumulates elapsed time', () => {
  it('TICK adds delta to elapsedMs', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'TICK', deltaMs: 5000 });
    expect(actor.getSnapshot().context.elapsedMs).toBe(5000);
    actor.stop();
  });

  it('multiple TICKs accumulate', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'TICK', deltaMs: 3000 });
    actor.send({ type: 'TICK', deltaMs: 2000 });
    expect(actor.getSnapshot().context.elapsedMs).toBe(5000);
    actor.stop();
  });

  it('completes and clamps elapsed time when duration is reached', () => {
    const actor = makeActor(5000);
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'TICK', deltaMs: 3000 });
    actor.send({ type: 'TICK', deltaMs: 3000 });

    expect(actor.getSnapshot().value).toBe('completed');
    expect(actor.getSnapshot().context.elapsedMs).toBe(5000);
    actor.stop();
  });

  it('TICK is ignored when paused', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'TICK', deltaMs: 1000 });
    actor.send({ type: 'PAUSE' });
    actor.send({ type: 'TICK', deltaMs: 999 }); // should be ignored
    expect(actor.getSnapshot().context.elapsedMs).toBe(1000);
    actor.stop();
  });
});

describe('meditationMachine — invalid transitions', () => {
  it('idle ignores PAUSE', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'PAUSE' });
    expect(actor.getSnapshot().value).toBe('idle');
    actor.stop();
  });

  it('completed ignores START', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'COMPLETE' });
    actor.send({ type: 'START' });
    expect(actor.getSnapshot().value).toBe('completed');
    actor.stop();
  });
});
