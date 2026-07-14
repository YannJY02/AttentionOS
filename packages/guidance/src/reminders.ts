export interface ReminderPolicySettings {
  readonly dailyPromptLimit: number;
  readonly frequencyMinutes: number;
  readonly quietHoursEnd: string;
  readonly quietHoursStart: string;
  readonly remindersEnabled: boolean;
}

export type ReminderDeliveryReason =
  | 'daily-cap'
  | 'disabled'
  | 'eligible'
  | 'frequency'
  | 'quiet-hours';

export type ReminderDeliveryDecision =
  | {
      readonly eligible: false;
      readonly reason: Exclude<ReminderDeliveryReason, 'eligible'>;
    }
  | {
      readonly eligible: true;
      readonly reason: 'eligible';
    };

export interface ReminderDeliveryInput {
  readonly deliveredToday: number;
  readonly lastDeliveredAt: string | null;
  readonly now: Date;
  readonly settings: ReminderPolicySettings;
}

function minutesFromTime(value: string): number {
  const [hours = '0', minutes = '0'] = value.split(':');
  return Number(hours) * 60 + Number(minutes);
}

function quietMinutes(start: string, end: string): number {
  const startMinutes = minutesFromTime(start);
  const endMinutes = minutesFromTime(end);
  return endMinutes > startMinutes
    ? endMinutes - startMinutes
    : 24 * 60 - startMinutes + endMinutes;
}

function isQuietTime(now: Date, start: string, end: string): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = minutesFromTime(start);
  const endMinutes = minutesFromTime(end);

  if (startMinutes === endMinutes) {
    return true;
  }

  return startMinutes < endMinutes
    ? currentMinutes >= startMinutes && currentMinutes < endMinutes
    : currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export function calculateReminderPromptBudget(settings: ReminderPolicySettings): number {
  if (!settings.remindersEnabled) {
    return 0;
  }

  const activeMinutes = 24 * 60 - quietMinutes(settings.quietHoursStart, settings.quietHoursEnd);
  const uncapped = Math.ceil(activeMinutes / settings.frequencyMinutes);
  return Math.min(uncapped, settings.dailyPromptLimit);
}

export function decideReminderDelivery({
  deliveredToday,
  lastDeliveredAt,
  now,
  settings,
}: ReminderDeliveryInput): ReminderDeliveryDecision {
  if (!settings.remindersEnabled) {
    return { eligible: false, reason: 'disabled' };
  }

  if (isQuietTime(now, settings.quietHoursStart, settings.quietHoursEnd)) {
    return { eligible: false, reason: 'quiet-hours' };
  }

  if (deliveredToday >= settings.dailyPromptLimit) {
    return { eligible: false, reason: 'daily-cap' };
  }

  if (lastDeliveredAt) {
    const lastDeliveryMs = Date.parse(lastDeliveredAt);
    const nextDeliveryMs = lastDeliveryMs + settings.frequencyMinutes * 60_000;
    if (Number.isFinite(lastDeliveryMs) && now.getTime() < nextDeliveryMs) {
      return { eligible: false, reason: 'frequency' };
    }
  }

  return { eligible: true, reason: 'eligible' };
}
