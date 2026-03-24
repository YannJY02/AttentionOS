import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { hierarchyNavMachine } from '../src/hierarchy-nav';

function makeActor() {
  return createActor(hierarchyNavMachine);
}

describe('hierarchyNavMachine — initial state', () => {
  it('starts at vision layer', () => {
    const actor = makeActor();
    actor.start();
    expect(actor.getSnapshot().value).toBe('vision');
    actor.stop();
  });

  it('breadcrumb starts empty', () => {
    const actor = makeActor();
    actor.start();
    expect(actor.getSnapshot().context.breadcrumb).toEqual([]);
    actor.stop();
  });
});

describe('hierarchyNavMachine — drill down', () => {
  it('vision → area on DRILL_DOWN', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_DOWN', entityId: 'vision-1' });
    expect(actor.getSnapshot().value).toBe('area');
    actor.stop();
  });

  it('area → goal on DRILL_DOWN', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_DOWN', entityId: 'vision-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'area-1' });
    expect(actor.getSnapshot().value).toBe('goal');
    actor.stop();
  });

  it('goal → project on DRILL_DOWN', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_DOWN', entityId: 'v-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'a-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'g-1' });
    expect(actor.getSnapshot().value).toBe('project');
    actor.stop();
  });

  it('project → task on DRILL_DOWN', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_DOWN', entityId: 'v-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'a-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'g-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'p-1' });
    expect(actor.getSnapshot().value).toBe('task');
    actor.stop();
  });

  it('task is leaf — DRILL_DOWN ignored', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_DOWN', entityId: 'v-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'a-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'g-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'p-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'leaf' }); // should be ignored
    expect(actor.getSnapshot().value).toBe('task');
    actor.stop();
  });
});

describe('hierarchyNavMachine — drill up', () => {
  it('task → project on DRILL_UP', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_DOWN', entityId: 'v-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'a-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'g-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'p-1' });
    actor.send({ type: 'DRILL_UP' });
    expect(actor.getSnapshot().value).toBe('project');
    actor.stop();
  });

  it('vision is root — DRILL_UP ignored', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_UP' });
    expect(actor.getSnapshot().value).toBe('vision');
    actor.stop();
  });
});

describe('hierarchyNavMachine — breadcrumb', () => {
  it('breadcrumb grows when drilling down', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_DOWN', entityId: 'vision-001' });
    expect(actor.getSnapshot().context.breadcrumb).toHaveLength(1);
    actor.send({ type: 'DRILL_DOWN', entityId: 'area-001' });
    expect(actor.getSnapshot().context.breadcrumb).toHaveLength(2);
    actor.stop();
  });

  it('breadcrumb shrinks when drilling up', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_DOWN', entityId: 'v-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'a-1' });
    actor.send({ type: 'DRILL_UP' });
    expect(actor.getSnapshot().context.breadcrumb).toHaveLength(1);
    actor.stop();
  });

  it('breadcrumb records entity ids', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_DOWN', entityId: 'vision-xyz' });
    expect(actor.getSnapshot().context.breadcrumb[0]).toBe('vision-xyz');
    actor.stop();
  });

  it('selectedEntityId updates on DRILL_DOWN', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_DOWN', entityId: 'area-123' });
    expect(actor.getSnapshot().context.selectedEntityId).toBe('area-123');
    actor.stop();
  });

  it('NAVIGATE_TO resets to target layer', () => {
    const actor = makeActor();
    actor.start();
    actor.send({ type: 'DRILL_DOWN', entityId: 'v-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'a-1' });
    actor.send({ type: 'DRILL_DOWN', entityId: 'g-1' });
    // Jump directly to vision
    actor.send({ type: 'NAVIGATE_TO', layer: 'vision' });
    expect(actor.getSnapshot().value).toBe('vision');
    expect(actor.getSnapshot().context.breadcrumb).toEqual([]);
    actor.stop();
  });
});
