import { beforeEach, describe, expect, it } from 'vitest';
import {
  REMINDER_SETTINGS_STORAGE_KEY,
  readReminderSettings,
  saveReminderSettings,
} from './reminderSettings';

describe('reminder settings storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults reminders off with quiet hours and hourly frequency', () => {
    expect(readReminderSettings()).toMatchObject({
      dailyPromptLimit: 6,
      frequencyMinutes: 60,
      integration: expect.objectContaining({
        auditTrailEnabled: true,
        channels: ['calendar-file', 'focus-handoff'],
        dailyPromptLimit: 6,
        enabled: false,
        permissionStatementAccepted: false,
      }),
      nativePermissionConsentVersion: null,
      priorityOverrideEnabled: false,
      quietHoursEnd: '08:00',
      quietHoursStart: '21:30',
      remindersEnabled: false,
      updatedAt: null,
    });
  });

  it('persists reminder consent, frequency, quiet hours, and priority override intent', () => {
    const saved = saveReminderSettings({
      dailyPromptLimit: 5,
      frequencyMinutes: 45,
      integration: {
        appAutoOpenTarget: 'raycast://extensions/calendar',
        auditTrailEnabled: true,
        channels: ['calendar-file', 'focus-handoff', 'app-auto-open'],
        dailyPromptLimit: 4,
        enabled: true,
        permissionStatementAccepted: true,
      },
      nativePermissionConsentVersion: 1,
      priorityOverrideEnabled: true,
      quietHoursEnd: '07:30',
      quietHoursStart: '22:15',
      remindersEnabled: true,
    });

    expect(saved).toMatchObject({
      dailyPromptLimit: 5,
      frequencyMinutes: 45,
      integration: expect.objectContaining({
        appAutoOpenTarget: 'raycast://extensions/calendar',
        channels: ['calendar-file', 'focus-handoff', 'app-auto-open'],
        dailyPromptLimit: 4,
        enabled: true,
        permissionStatementAccepted: true,
      }),
      nativePermissionConsentVersion: 1,
      priorityOverrideEnabled: true,
      quietHoursEnd: '07:30',
      quietHoursStart: '22:15',
      remindersEnabled: true,
      updatedAt: expect.any(String),
    });
    expect(localStorage.getItem(REMINDER_SETTINGS_STORAGE_KEY)).toContain('quietHoursStart');
  });

  it('sanitizes malformed stored reminder settings', () => {
    localStorage.setItem(
      REMINDER_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        dailyPromptLimit: 99,
        frequencyMinutes: 999,
        integration: {
          appAutoOpenTarget: '',
          auditTrailEnabled: 'no',
          channels: ['calendar-file', 'unknown', 'calendar-file'],
          dailyPromptLimit: 99,
          enabled: 'yes',
          permissionStatementAccepted: 'yes',
        },
        priorityOverrideEnabled: 'yes',
        quietHoursEnd: '99:99',
        quietHoursStart: '24:00',
        remindersEnabled: 'yes',
      }),
    );

    expect(readReminderSettings()).toMatchObject({
      dailyPromptLimit: 24,
      frequencyMinutes: 240,
      integration: expect.objectContaining({
        appAutoOpenTarget: null,
        auditTrailEnabled: true,
        channels: ['calendar-file'],
        dailyPromptLimit: 6,
        enabled: false,
        permissionStatementAccepted: false,
      }),
      nativePermissionConsentVersion: null,
      priorityOverrideEnabled: false,
      quietHoursEnd: '08:00',
      quietHoursStart: '21:30',
      remindersEnabled: false,
    });
  });

  it('migrates legacy reminder intent to off until native permission consent is recorded', () => {
    localStorage.setItem(
      REMINDER_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        dailyPromptLimit: 6,
        frequencyMinutes: 60,
        priorityOverrideEnabled: false,
        quietHoursEnd: '08:00',
        quietHoursStart: '22:00',
        remindersEnabled: true,
      }),
    );

    expect(readReminderSettings()).toMatchObject({
      nativePermissionConsentVersion: null,
      remindersEnabled: false,
    });
  });
});
