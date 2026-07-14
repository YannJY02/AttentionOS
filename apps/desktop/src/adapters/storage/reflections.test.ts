import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearReflectionRecoveryIssue,
  REFLECTION_CORRUPT_STORAGE_KEY,
  REFLECTION_RECOVERY_STORAGE_KEY,
  REFLECTION_STORAGE_KEY,
  readReflectionRecoveryIssue,
  readReflections,
  saveReflection,
} from './reflections';

describe('ritual reflection storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves reflection content as a ritual entity', () => {
    const reflection = saveReflection('  Notice the starting condition.  ', {
      followUpTargets: ['task', 'task', 'project'],
    });

    expect(reflection).toMatchObject({
      content: 'Notice the starting condition.',
      entityType: 'reflection',
      properties: {
        ritualFollowUpTargets: ['task', 'project'],
        ritualInputKind: 'reflection',
        source: 'ritual',
      },
      status: 'completed',
      workflowStage: 'ritual',
    });
    expect(readReflections()).toHaveLength(1);
  });

  it('quarantines malformed reflection payloads before returning an empty list', () => {
    localStorage.setItem(REFLECTION_STORAGE_KEY, '{broken');

    expect(readReflections()).toEqual([]);
    expect(localStorage.getItem(REFLECTION_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(REFLECTION_CORRUPT_STORAGE_KEY)).toContain('{broken');
    expect(readReflectionRecoveryIssue()).toMatchObject({
      originalBytes: '{broken'.length,
      quarantined: true,
    });
  });

  it('preserves malformed payloads when saving the next valid reflection', () => {
    localStorage.setItem(REFLECTION_STORAGE_KEY, '{broken');

    const reflection = saveReflection('Recovered with a fresh note.');

    expect(reflection.content).toBe('Recovered with a fresh note.');
    expect(localStorage.getItem(REFLECTION_CORRUPT_STORAGE_KEY)).toContain('{broken');
    expect(readReflections()).toEqual([expect.objectContaining({ id: reflection.id })]);
  });

  it('clears recovery warning without deleting preserved corrupt payloads', () => {
    localStorage.setItem(REFLECTION_STORAGE_KEY, '{broken');
    readReflections();

    clearReflectionRecoveryIssue();

    expect(localStorage.getItem(REFLECTION_RECOVERY_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(REFLECTION_CORRUPT_STORAGE_KEY)).toContain('{broken');
  });
});
