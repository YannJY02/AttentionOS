import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createNativeReminderAdapter,
  NATIVE_REMINDER_DELIVERY_STORAGE_KEY,
} from './nativeNotifications';
import { REMINDER_SETTINGS_STORAGE_KEY } from './storage/reminderSettings';

const NOW = new Date(2026, 6, 14, 10);

function enableReminderSettings() {
  localStorage.setItem(
    REMINDER_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      dailyPromptLimit: 2,
      frequencyMinutes: 60,
      integration: {
        appAutoOpenTarget: null,
        auditTrailEnabled: true,
        channels: ['calendar-file'],
        dailyPromptLimit: 2,
        enabled: false,
        permissionStatementAccepted: false,
      },
      nativePermissionConsentVersion: 1,
      priorityOverrideEnabled: false,
      quietHoursEnd: '08:00',
      quietHoursStart: '22:00',
      remindersEnabled: true,
      updatedAt: NOW.toISOString(),
    }),
  );
}

describe('native reminder adapter', () => {
  beforeEach(() => {
    localStorage.clear();
    enableReminderSettings();
  });

  it('delivers through the granted Tauri plugin and records the local daily count', async () => {
    const sendNotification = vi.fn();
    const requestPermission = vi.fn(async () => 'granted' as const);
    const adapter = createNativeReminderAdapter({
      isPermissionGranted: vi.fn(async () => true),
      isTauri: () => true,
      requestPermission,
      sendNotification,
    });

    await expect(adapter.deliverDueReminder(NOW)).resolves.toEqual({ status: 'delivered' });
    expect(requestPermission).not.toHaveBeenCalled();
    expect(sendNotification).toHaveBeenCalledWith({
      body: 'Pause, review your current focus, and choose the next intentional action.',
      title: 'Attention check-in',
    });
    expect(JSON.parse(localStorage.getItem(NATIVE_REMINDER_DELIVERY_STORAGE_KEY) ?? '{}')).toEqual({
      deliveredToday: 1,
      lastDeliveredAt: NOW.toISOString(),
      localDate: '2026-07-14',
    });
  });

  it('requests permission only in explicit user context and never repeats a denied prompt during delivery', async () => {
    const requestPermission = vi.fn(async () => 'denied' as const);
    const sendNotification = vi.fn();
    const adapter = createNativeReminderAdapter({
      isPermissionGranted: vi.fn(async () => false),
      isTauri: () => true,
      requestPermission,
      sendNotification,
    });

    await expect(adapter.requestPermissionFromUser()).resolves.toBe('denied');
    await expect(adapter.deliverDueReminder(NOW)).resolves.toEqual({
      status: 'permission-not-granted',
    });

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(sendNotification).not.toHaveBeenCalled();
    expect(localStorage.getItem(NATIVE_REMINDER_DELIVERY_STORAGE_KEY)).toBeNull();
  });

  it('serializes concurrent delivery checks so only one notification can consume a cadence slot', async () => {
    let releasePermissionCheck!: () => void;
    const firstPermissionCheck = new Promise<void>((resolve) => {
      releasePermissionCheck = resolve;
    });
    const sendNotification = vi.fn();
    const isPermissionGranted = vi
      .fn<() => Promise<boolean>>()
      .mockImplementationOnce(async () => {
        await firstPermissionCheck;
        return true;
      })
      .mockResolvedValue(true);
    const adapter = createNativeReminderAdapter({
      isPermissionGranted,
      isTauri: () => true,
      requestPermission: vi.fn(async () => 'granted' as const),
      sendNotification,
    });

    const firstDelivery = adapter.deliverDueReminder(NOW);
    const competingDelivery = adapter.deliverDueReminder(NOW);
    releasePermissionCheck();

    await expect(Promise.all([firstDelivery, competingDelivery])).resolves.toEqual([
      { status: 'delivered' },
      { status: 'frequency' },
    ]);
    expect(sendNotification).toHaveBeenCalledTimes(1);
    expect(
      JSON.parse(localStorage.getItem(NATIVE_REMINDER_DELIVERY_STORAGE_KEY) ?? '{}'),
    ).toMatchObject({ deliveredToday: 1 });
  });
});
