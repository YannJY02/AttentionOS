import { describe, expect, it } from 'vitest';
import { calculateReminderPromptBudget } from '../src/reminders';

describe('reminder policy', () => {
  it('returns zero when reminders are disabled', () => {
    expect(
      calculateReminderPromptBudget({
        frequencyMinutes: 60,
        integration: { dailyPromptLimit: 8, enabled: true },
        quietHoursEnd: '08:00',
        quietHoursStart: '22:00',
        remindersEnabled: false,
      }),
    ).toBe(0);
  });

  it('honors overnight quiet hours and the integration cap', () => {
    expect(
      calculateReminderPromptBudget({
        frequencyMinutes: 60,
        integration: { dailyPromptLimit: 6, enabled: true },
        quietHoursEnd: '08:00',
        quietHoursStart: '22:00',
        remindersEnabled: true,
      }),
    ).toBe(6);
  });
});
