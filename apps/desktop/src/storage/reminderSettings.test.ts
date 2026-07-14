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
      frequencyMinutes: 60,
      integration: expect.objectContaining({
        auditTrailEnabled: true,
        channels: ['calendar-file', 'focus-handoff'],
        dailyPromptLimit: 6,
        enabled: false,
        permissionStatementAccepted: false,
      }),
      priorityOverrideEnabled: false,
      quietHoursEnd: '08:00',
      quietHoursStart: '21:30',
      remindersEnabled: false,
      updatedAt: null,
    });
  });

  it('persists reminder consent, frequency, quiet hours, and priority override intent', () => {
    const saved = saveReminderSettings({
      frequencyMinutes: 45,
      integration: {
        appAutoOpenTarget: 'raycast://extensions/calendar',
        auditTrailEnabled: true,
        channels: ['calendar-file', 'focus-handoff', 'app-auto-open'],
        dailyPromptLimit: 4,
        enabled: true,
        permissionStatementAccepted: true,
      },
      priorityOverrideEnabled: true,
      quietHoursEnd: '07:30',
      quietHoursStart: '22:15',
      remindersEnabled: true,
    });

    expect(saved).toMatchObject({
      frequencyMinutes: 45,
      integration: expect.objectContaining({
        appAutoOpenTarget: 'raycast://extensions/calendar',
        channels: ['calendar-file', 'focus-handoff', 'app-auto-open'],
        dailyPromptLimit: 4,
        enabled: true,
        permissionStatementAccepted: true,
      }),
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
        quietHoursEnd: 'bad',
        quietHoursStart: 'also bad',
        remindersEnabled: 'yes',
      }),
    );

    expect(readReminderSettings()).toMatchObject({
      frequencyMinutes: 240,
      integration: expect.objectContaining({
        appAutoOpenTarget: null,
        auditTrailEnabled: true,
        channels: ['calendar-file'],
        dailyPromptLimit: 6,
        enabled: false,
        permissionStatementAccepted: false,
      }),
      priorityOverrideEnabled: false,
      quietHoursEnd: '08:00',
      quietHoursStart: '21:30',
      remindersEnabled: false,
    });
  });
});
