import { queuePersistAppState } from './persistence';
import { recordMalformedStorageEntry } from './storageRecovery';

export const REMINDER_SETTINGS_STORAGE_KEY = 'attentionos.reminderSettings.v1';

export type ReminderIntegrationChannel = 'app-auto-open' | 'calendar-file' | 'focus-handoff';
export type NativePermissionConsentVersion = 1 | null;

export interface ReminderIntegrationSettings {
  readonly appAutoOpenTarget: string | null;
  readonly auditTrailEnabled: boolean;
  readonly channels: readonly ReminderIntegrationChannel[];
  readonly dailyPromptLimit: number;
  readonly enabled: boolean;
  readonly permissionStatementAccepted: boolean;
}

export interface ReminderSettings {
  readonly dailyPromptLimit: number;
  readonly frequencyMinutes: number;
  readonly integration: ReminderIntegrationSettings;
  readonly nativePermissionConsentVersion: NativePermissionConsentVersion;
  readonly priorityOverrideEnabled: boolean;
  readonly quietHoursEnd: string;
  readonly quietHoursStart: string;
  readonly remindersEnabled: boolean;
  readonly updatedAt: string | null;
}

export const REMINDER_INTEGRATION_CHANNELS: readonly ReminderIntegrationChannel[] = [
  'calendar-file',
  'focus-handoff',
  'app-auto-open',
];

export const DEFAULT_REMINDER_INTEGRATION_SETTINGS: ReminderIntegrationSettings = {
  appAutoOpenTarget: null,
  auditTrailEnabled: true,
  channels: ['calendar-file', 'focus-handoff'],
  dailyPromptLimit: 6,
  enabled: false,
  permissionStatementAccepted: false,
};

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  dailyPromptLimit: 6,
  frequencyMinutes: 60,
  integration: DEFAULT_REMINDER_INTEGRATION_SETTINGS,
  nativePermissionConsentVersion: null,
  priorityOverrideEnabled: false,
  quietHoursEnd: '08:00',
  quietHoursStart: '21:30',
  remindersEnabled: false,
  updatedAt: null,
};

export interface ReminderSettingsInput {
  readonly dailyPromptLimit: number;
  readonly frequencyMinutes: number;
  readonly integration?: Partial<ReminderIntegrationSettings>;
  readonly nativePermissionConsentVersion: NativePermissionConsentVersion;
  readonly priorityOverrideEnabled: boolean;
  readonly quietHoursEnd: string;
  readonly quietHoursStart: string;
  readonly remindersEnabled: boolean;
}

function isReminderSettings(value: unknown): value is Partial<ReminderSettings> {
  return typeof value === 'object' && value !== null;
}

function sanitizeFrequencyMinutes(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_REMINDER_SETTINGS.frequencyMinutes;
  }

  return Math.min(240, Math.max(15, Math.round(parsed)));
}

function sanitizeTime(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : fallback;
}

function sanitizeNativePermissionConsentVersion(value: unknown): NativePermissionConsentVersion {
  return value === 1 ? 1 : null;
}

function booleanOrDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function sanitizeDailyPromptLimit(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_REMINDER_INTEGRATION_SETTINGS.dailyPromptLimit;
  }

  return Math.min(6, Math.max(1, Math.round(parsed)));
}

function sanitizeNativeDailyPromptLimit(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_REMINDER_SETTINGS.dailyPromptLimit;
  }

  return Math.min(24, Math.max(1, Math.round(parsed)));
}

function sanitizeIntegrationChannels(value: unknown): readonly ReminderIntegrationChannel[] {
  if (!Array.isArray(value)) {
    return DEFAULT_REMINDER_INTEGRATION_SETTINGS.channels;
  }

  const channels = value.filter((channel): channel is ReminderIntegrationChannel =>
    REMINDER_INTEGRATION_CHANNELS.includes(channel),
  );

  return channels.length > 0
    ? [...new Set(channels)]
    : DEFAULT_REMINDER_INTEGRATION_SETTINGS.channels;
}

function sanitizeIntegrationSettings(value: unknown): ReminderIntegrationSettings {
  const parsed = typeof value === 'object' && value !== null ? value : {};
  const partial = parsed as Partial<Record<keyof ReminderIntegrationSettings, unknown>>;

  return {
    appAutoOpenTarget: stringOrNull(partial.appAutoOpenTarget),
    auditTrailEnabled: booleanOrDefault(
      partial.auditTrailEnabled,
      DEFAULT_REMINDER_INTEGRATION_SETTINGS.auditTrailEnabled,
    ),
    channels: sanitizeIntegrationChannels(partial.channels),
    dailyPromptLimit: sanitizeDailyPromptLimit(partial.dailyPromptLimit),
    enabled: booleanOrDefault(partial.enabled, DEFAULT_REMINDER_INTEGRATION_SETTINGS.enabled),
    permissionStatementAccepted: booleanOrDefault(
      partial.permissionStatementAccepted,
      DEFAULT_REMINDER_INTEGRATION_SETTINGS.permissionStatementAccepted,
    ),
  };
}

export function readReminderSettings(): ReminderSettings {
  const raw = localStorage.getItem(REMINDER_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_REMINDER_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isReminderSettings(parsed)) {
      recordMalformedStorageEntry({
        error: new Error('Reminder settings are not an object.'),
        fallback: 'Using default reminder settings with native reminders off.',
        payload: raw,
        storageKey: REMINDER_SETTINGS_STORAGE_KEY,
      });
      return DEFAULT_REMINDER_SETTINGS;
    }

    const nativePermissionConsentVersion = sanitizeNativePermissionConsentVersion(
      parsed.nativePermissionConsentVersion,
    );

    return {
      dailyPromptLimit: sanitizeNativeDailyPromptLimit(
        parsed.dailyPromptLimit ??
          (typeof parsed.integration === 'object' && parsed.integration !== null
            ? (parsed.integration as Partial<ReminderIntegrationSettings>).dailyPromptLimit
            : undefined),
      ),
      frequencyMinutes: sanitizeFrequencyMinutes(parsed.frequencyMinutes),
      integration: sanitizeIntegrationSettings(parsed.integration),
      nativePermissionConsentVersion,
      priorityOverrideEnabled: booleanOrDefault(
        parsed.priorityOverrideEnabled,
        DEFAULT_REMINDER_SETTINGS.priorityOverrideEnabled,
      ),
      quietHoursEnd: sanitizeTime(parsed.quietHoursEnd, DEFAULT_REMINDER_SETTINGS.quietHoursEnd),
      quietHoursStart: sanitizeTime(
        parsed.quietHoursStart,
        DEFAULT_REMINDER_SETTINGS.quietHoursStart,
      ),
      remindersEnabled:
        nativePermissionConsentVersion === 1 &&
        booleanOrDefault(parsed.remindersEnabled, DEFAULT_REMINDER_SETTINGS.remindersEnabled),
      updatedAt: stringOrNull(parsed.updatedAt),
    };
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Using default reminder settings with native reminders off.',
      payload: raw,
      storageKey: REMINDER_SETTINGS_STORAGE_KEY,
    });
    return DEFAULT_REMINDER_SETTINGS;
  }
}

export function saveReminderSettings(settings: ReminderSettingsInput): ReminderSettings {
  const nativePermissionConsentVersion = sanitizeNativePermissionConsentVersion(
    settings.nativePermissionConsentVersion,
  );
  const nextSettings: ReminderSettings = {
    dailyPromptLimit: sanitizeNativeDailyPromptLimit(settings.dailyPromptLimit),
    frequencyMinutes: sanitizeFrequencyMinutes(settings.frequencyMinutes),
    integration: sanitizeIntegrationSettings(settings.integration),
    nativePermissionConsentVersion,
    priorityOverrideEnabled: Boolean(settings.priorityOverrideEnabled),
    quietHoursEnd: sanitizeTime(settings.quietHoursEnd, DEFAULT_REMINDER_SETTINGS.quietHoursEnd),
    quietHoursStart: sanitizeTime(
      settings.quietHoursStart,
      DEFAULT_REMINDER_SETTINGS.quietHoursStart,
    ),
    remindersEnabled: nativePermissionConsentVersion === 1 && Boolean(settings.remindersEnabled),
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(REMINDER_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  queuePersistAppState();

  return nextSettings;
}
