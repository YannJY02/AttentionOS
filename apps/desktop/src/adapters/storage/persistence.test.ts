import { beforeEach, describe, expect, it } from 'vitest';
import {
  APP_STATE_BACKUP_STORAGE_KEY,
  APP_STATE_CORRUPT_BACKUP_STORAGE_KEY,
  APP_STATE_RECOVERY_STORAGE_KEY,
  APP_STATE_SNAPSHOT_STORAGE_KEY,
  createAppStateBackup,
  exportAppStateAsDownload,
  exportAppStateAsPortableFile,
  importAppStateFromPayload,
  initializeAppPersistence,
  persistCurrentAppState,
  readPersistenceRecoveryIssue,
  restoreAppStateSnapshot,
  serializeAppStateSnapshot,
  shouldWaitForBrowserPersistenceRestore,
} from './persistence';

const HIERARCHY_STORAGE_KEY = 'attentionos.hierarchy.v1';
const NATIVE_REMINDER_DELIVERY_STORAGE_KEY = 'attentionos.nativeReminderDelivery.v1';
const ONBOARDING_STORAGE_KEY = 'attentionos.onboarding.v1';
const REFLECTION_STORAGE_KEY = 'attentionos.reflections.v1';
const REMINDER_SETTINGS_STORAGE_KEY = 'attentionos.reminderSettings.v1';

function makeSnapshot(entries: Record<string, string>) {
  return JSON.stringify({
    appVersion: '0.1.0',
    entries,
    exportedAt: '2026-05-23T00:00:00.000Z',
    schemaVersion: 1,
  });
}

function makeValidHierarchy(taskOverrides: Record<string, unknown> = {}) {
  return JSON.stringify([
    {
      id: 'vision-import',
      entityType: 'task',
      hierarchyLayer: 'vision',
      title: 'Imported vision',
      status: 'active',
      properties: {},
      workflowStage: 'overview',
      createdAt: '2026-05-23T00:00:00.000Z',
      updatedAt: '2026-05-23T00:00:00.000Z',
    },
    {
      id: 'area-import',
      entityType: 'task',
      hierarchyLayer: 'area',
      title: 'Imported area',
      status: 'active',
      properties: {},
      workflowStage: 'overview',
      parentId: 'vision-import',
      createdAt: '2026-05-23T00:00:00.000Z',
      updatedAt: '2026-05-23T00:00:00.000Z',
    },
    {
      id: 'goal-import',
      entityType: 'task',
      hierarchyLayer: 'goal',
      title: 'Imported goal',
      status: 'active',
      properties: {},
      workflowStage: 'overview',
      parentId: 'area-import',
      createdAt: '2026-05-23T00:00:00.000Z',
      updatedAt: '2026-05-23T00:00:00.000Z',
    },
    {
      id: 'project-import',
      entityType: 'task',
      hierarchyLayer: 'project',
      title: 'Imported project',
      status: 'active',
      properties: {},
      workflowStage: 'overview',
      parentId: 'goal-import',
      createdAt: '2026-05-23T00:00:00.000Z',
      updatedAt: '2026-05-23T00:00:00.000Z',
    },
    {
      id: 'task-import',
      entityType: 'task',
      hierarchyLayer: 'task',
      title: 'Imported task',
      status: 'active',
      properties: {
        estimatedMinutes: 25,
      },
      workflowStage: 'overview',
      parentId: 'project-import',
      createdAt: '2026-05-23T00:00:00.000Z',
      updatedAt: '2026-05-23T00:00:00.000Z',
      ...taskOverrides,
    },
  ]);
}

describe('desktop persistence snapshot', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('serializes known app storage keys into a portable snapshot', () => {
    localStorage.setItem(HIERARCHY_STORAGE_KEY, '[{"id":"task-1"}]');
    localStorage.setItem(
      NATIVE_REMINDER_DELIVERY_STORAGE_KEY,
      '{"deliveredToday":1,"lastDeliveredAt":"2026-05-23T16:00:00.000Z","localDate":"2026-05-23"}',
    );
    localStorage.setItem(ONBOARDING_STORAGE_KEY, '{"completedAt":"2026-05-23T16:00:00.000Z"}');
    localStorage.setItem(REFLECTION_STORAGE_KEY, '[{"id":"reflection-1"}]');
    localStorage.setItem(REMINDER_SETTINGS_STORAGE_KEY, '{"remindersEnabled":true}');

    const payload = serializeAppStateSnapshot();
    const parsed = JSON.parse(payload);

    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.entries[HIERARCHY_STORAGE_KEY]).toBe('[{"id":"task-1"}]');
    expect(parsed.entries[NATIVE_REMINDER_DELIVERY_STORAGE_KEY]).toContain('deliveredToday');
    expect(parsed.entries[ONBOARDING_STORAGE_KEY]).toContain('completedAt');
    expect(parsed.entries[REFLECTION_STORAGE_KEY]).toBe('[{"id":"reflection-1"}]');
    expect(parsed.entries[REMINDER_SETTINGS_STORAGE_KEY]).toContain('remindersEnabled');
  });

  it('restores a valid snapshot and removes missing managed keys', () => {
    localStorage.setItem(REFLECTION_STORAGE_KEY, '[{"id":"old"}]');

    restoreAppStateSnapshot(makeSnapshot({ [HIERARCHY_STORAGE_KEY]: makeValidHierarchy() }));

    expect(localStorage.getItem(HIERARCHY_STORAGE_KEY)).toContain('task-import');
    expect(localStorage.getItem(REFLECTION_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(APP_STATE_SNAPSHOT_STORAGE_KEY)).toContain('task-import');
  });

  it('rejects unsupported snapshot schema versions', async () => {
    await expect(
      importAppStateFromPayload(
        JSON.stringify({
          appVersion: '0.1.0',
          entries: {},
          exportedAt: '2026-05-23T00:00:00.000Z',
          schemaVersion: 999,
        }),
      ),
    ).rejects.toThrow(/unsupported/i);
  });

  it('restores the browser fallback snapshot when no live app state exists', async () => {
    localStorage.setItem(
      APP_STATE_SNAPSHOT_STORAGE_KEY,
      makeSnapshot({ [HIERARCHY_STORAGE_KEY]: makeValidHierarchy() }),
    );

    expect(shouldWaitForBrowserPersistenceRestore()).toBe(true);

    const result = await initializeAppPersistence();

    expect(result).toMatchObject({
      backend: 'browser',
      restored: true,
      snapshotFound: true,
    });
    expect(localStorage.getItem(HIERARCHY_STORAGE_KEY)).toContain('task-import');
  });

  it('quarantines corrupt browser fallback snapshots before continuing', async () => {
    localStorage.setItem(APP_STATE_SNAPSHOT_STORAGE_KEY, 'not valid json');

    const result = await initializeAppPersistence();

    expect(result).toMatchObject({
      backend: 'browser',
      restored: false,
      snapshotFound: true,
    });
    expect(result.recoveryIssue).toMatchObject({
      backend: 'browser',
      originalBytes: 'not valid json'.length,
      quarantined: true,
    });
    expect(localStorage.getItem(APP_STATE_CORRUPT_BACKUP_STORAGE_KEY)).toContain('not valid json');
    expect(readPersistenceRecoveryIssue()).toMatchObject({
      message: expect.stringMatching(/json/i),
    });
    expect(localStorage.getItem(APP_STATE_SNAPSHOT_STORAGE_KEY)).toContain('"schemaVersion": 1');
  });

  it('rejects imports with unmanaged storage keys without applying them', async () => {
    localStorage.setItem(HIERARCHY_STORAGE_KEY, '[{"id":"existing"}]');

    await expect(
      importAppStateFromPayload(
        makeSnapshot({
          'attentionos.hierarchy.v1': makeValidHierarchy(),
          'attentionos.unmanaged.v1': 'unexpected',
        }),
      ),
    ).rejects.toThrow(/unknown storage entry/i);

    expect(localStorage.getItem(HIERARCHY_STORAGE_KEY)).toBe('[{"id":"existing"}]');
  });

  it('rejects imports with malformed managed JSON without applying them', async () => {
    localStorage.setItem(HIERARCHY_STORAGE_KEY, '[{"id":"existing"}]');

    await expect(
      importAppStateFromPayload(
        makeSnapshot({
          [HIERARCHY_STORAGE_KEY]: '{broken',
        }),
      ),
    ).rejects.toThrow(/json/i);

    expect(localStorage.getItem(HIERARCHY_STORAGE_KEY)).toBe('[{"id":"existing"}]');
    expect(localStorage.getItem(APP_STATE_RECOVERY_STORAGE_KEY)).toBeNull();
  });

  it('rejects imported hierarchy tasks that should be projects without applying them', async () => {
    localStorage.setItem(HIERARCHY_STORAGE_KEY, '[{"id":"existing"}]');

    await expect(
      importAppStateFromPayload(
        makeSnapshot({
          [HIERARCHY_STORAGE_KEY]: makeValidHierarchy({
            properties: {
              estimatedMinutes: 25,
              projectSignals: ['deliverable', 'multi_block'],
            },
          }),
        }),
      ),
    ).rejects.toThrow(/must be a project/i);

    expect(localStorage.getItem(HIERARCHY_STORAGE_KEY)).toBe('[{"id":"existing"}]');
  });

  it('rejects imported hierarchy projects deeper than one subproject layer', async () => {
    const hierarchy = JSON.parse(makeValidHierarchy()) as Array<Record<string, unknown>>;
    hierarchy.push({
      id: 'subproject-import',
      entityType: 'task',
      hierarchyLayer: 'project',
      title: 'Imported subproject',
      status: 'active',
      properties: { projectSignals: ['deliverable', 'multi_block'] },
      workflowStage: 'overview',
      parentId: 'project-import',
      createdAt: '2026-05-23T00:00:00.000Z',
      updatedAt: '2026-05-23T00:00:00.000Z',
    });
    hierarchy.push({
      id: 'too-deep-project',
      entityType: 'task',
      hierarchyLayer: 'project',
      title: 'Too deep project',
      status: 'active',
      properties: { projectSignals: ['deliverable', 'multi_block'] },
      workflowStage: 'overview',
      parentId: 'subproject-import',
      createdAt: '2026-05-23T00:00:00.000Z',
      updatedAt: '2026-05-23T00:00:00.000Z',
    });

    await expect(
      importAppStateFromPayload(
        makeSnapshot({
          [HIERARCHY_STORAGE_KEY]: JSON.stringify(hierarchy),
        }),
      ),
    ).rejects.toThrow(/one-subproject-layer/i);
  });

  it('persists and backs up through browser storage outside Tauri', async () => {
    localStorage.setItem(HIERARCHY_STORAGE_KEY, '[{"id":"task-1"}]');

    const saved = await persistCurrentAppState();
    const backup = await createAppStateBackup();
    const exportPayload = exportAppStateAsDownload();

    expect(saved.backend).toBe('browser');
    expect(backup.backend).toBe('browser');
    expect(localStorage.getItem(APP_STATE_SNAPSHOT_STORAGE_KEY)).toContain('task-1');
    expect(localStorage.getItem(APP_STATE_BACKUP_STORAGE_KEY)).toContain('task-1');
    expect(exportPayload).toContain('task-1');
  });

  it('prepares a portable browser export without mutating managed state', async () => {
    localStorage.setItem(HIERARCHY_STORAGE_KEY, '[{"id":"portable-task"}]');

    const exportResult = await exportAppStateAsPortableFile();

    expect(exportResult).toMatchObject({
      backend: 'browser',
      bytes: expect.any(Number),
      payload: expect.stringContaining('portable-task'),
      writtenAtMs: expect.any(Number),
    });
    expect(localStorage.getItem(HIERARCHY_STORAGE_KEY)).toBe('[{"id":"portable-task"}]');
    expect(localStorage.getItem(APP_STATE_BACKUP_STORAGE_KEY)).toBeNull();
  });

  it('exports and restores ritual reflections through a portable snapshot', async () => {
    localStorage.setItem(
      REFLECTION_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'reflection-exported',
          content: 'Export this reflection.',
          entityType: 'reflection',
          properties: { ritualInputKind: 'reflection', source: 'ritual' },
          status: 'completed',
          title: 'Ritual reflection',
          workflowStage: 'ritual',
        },
      ]),
    );

    const payload = exportAppStateAsDownload();
    localStorage.clear();
    await importAppStateFromPayload(payload);

    expect(localStorage.getItem(REFLECTION_STORAGE_KEY)).toContain('Export this reflection.');
  });
});
