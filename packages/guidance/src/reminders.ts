export interface ReminderPolicySettings {
  readonly frequencyMinutes: number;
  readonly integration: {
    readonly dailyPromptLimit: number;
    readonly enabled: boolean;
  };
  readonly quietHoursEnd: string;
  readonly quietHoursStart: string;
  readonly remindersEnabled: boolean;
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

export function calculateReminderPromptBudget(settings: ReminderPolicySettings): number {
  if (!settings.remindersEnabled) {
    return 0;
  }

  const activeMinutes = 24 * 60 - quietMinutes(settings.quietHoursStart, settings.quietHoursEnd);
  const uncapped = Math.ceil(activeMinutes / settings.frequencyMinutes);
  return settings.integration.enabled
    ? Math.min(uncapped, settings.integration.dailyPromptLimit)
    : uncapped;
}
