import { describe, expect, it } from 'vitest';
import { calculateReminderPromptBudget, decideReminderDelivery } from '../src/reminders';

describe('reminder policy', () => {
  const localDate = (hour: number, minute = 0) => new Date(2026, 6, 14, hour, minute);

  it('returns zero when reminders are disabled', () => {
    expect(
      calculateReminderPromptBudget({
        dailyPromptLimit: 6,
        frequencyMinutes: 60,
        quietHoursEnd: '08:00',
        quietHoursStart: '22:00',
        remindersEnabled: false,
      }),
    ).toBe(0);
  });

  it('honors overnight quiet hours and the native daily cap', () => {
    expect(
      calculateReminderPromptBudget({
        dailyPromptLimit: 6,
        frequencyMinutes: 60,
        quietHoursEnd: '08:00',
        quietHoursStart: '22:00',
        remindersEnabled: true,
      }),
    ).toBe(6);
  });

  it('enforces enabled state, overnight quiet hours, cadence, and the daily cap', () => {
    const settings = {
      dailyPromptLimit: 6,
      frequencyMinutes: 60,
      quietHoursEnd: '08:00',
      quietHoursStart: '22:00',
      remindersEnabled: true,
    } as const;

    expect(
      decideReminderDelivery({
        deliveredToday: 0,
        lastDeliveredAt: null,
        now: localDate(10),
        settings: { ...settings, remindersEnabled: false },
      }),
    ).toMatchObject({ eligible: false, reason: 'disabled' });
    expect(
      decideReminderDelivery({
        deliveredToday: 0,
        lastDeliveredAt: null,
        now: localDate(22, 30),
        settings,
      }),
    ).toMatchObject({ eligible: false, reason: 'quiet-hours' });
    expect(
      decideReminderDelivery({
        deliveredToday: 1,
        lastDeliveredAt: localDate(9, 30).toISOString(),
        now: localDate(10),
        settings,
      }),
    ).toMatchObject({ eligible: false, reason: 'frequency' });
    expect(
      decideReminderDelivery({
        deliveredToday: 6,
        lastDeliveredAt: localDate(8).toISOString(),
        now: localDate(10),
        settings,
      }),
    ).toMatchObject({ eligible: false, reason: 'daily-cap' });
    expect(
      decideReminderDelivery({
        deliveredToday: 5,
        lastDeliveredAt: localDate(8).toISOString(),
        now: localDate(10),
        settings,
      }),
    ).toEqual({ eligible: true, reason: 'eligible' });
  });
});
