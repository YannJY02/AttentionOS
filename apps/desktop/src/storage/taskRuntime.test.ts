import { describe, expect, it } from 'vitest';
import {
  clearPersistedTaskRuntime,
  readCurrentPersistedTaskRuntime,
  readPersistedTaskRuntime,
  savePersistedTaskRuntime,
  TASK_RUNTIME_STORAGE_KEY,
} from './taskRuntime';

describe('task runtime persistence', () => {
  it('saves and reads the active task runtime', () => {
    const saved = savePersistedTaskRuntime({
      actualMinutes: 7.4,
      state: 'executing',
      taskId: 'task-1',
    });

    expect(saved).toMatchObject({
      actualMinutes: 7,
      state: 'executing',
      taskId: 'task-1',
    });
    expect(readPersistedTaskRuntime('task-1')).toMatchObject({
      actualMinutes: 7,
      state: 'executing',
      taskId: 'task-1',
    });
    expect(readCurrentPersistedTaskRuntime()).toMatchObject({
      actualMinutes: 7,
      state: 'executing',
      taskId: 'task-1',
    });
  });

  it('ignores malformed runtime and runtime for another task', () => {
    localStorage.setItem(TASK_RUNTIME_STORAGE_KEY, '{broken');
    expect(readPersistedTaskRuntime('task-1')).toBeNull();

    localStorage.setItem(
      TASK_RUNTIME_STORAGE_KEY,
      JSON.stringify({
        actualMinutes: 5,
        state: 'executing',
        taskId: 'other-task',
        updatedAt: '2026-05-24T00:00:00.000Z',
      }),
    );

    expect(readPersistedTaskRuntime('task-1')).toBeNull();
  });

  it('clears only the matching active task runtime', () => {
    savePersistedTaskRuntime({
      actualMinutes: 5,
      state: 'executing',
      taskId: 'task-1',
    });

    clearPersistedTaskRuntime('other-task');
    expect(readPersistedTaskRuntime('task-1')).not.toBeNull();

    clearPersistedTaskRuntime('task-1');
    expect(readPersistedTaskRuntime('task-1')).toBeNull();
  });
});
