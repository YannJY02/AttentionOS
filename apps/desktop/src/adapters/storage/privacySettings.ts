import { queuePersistAppState } from './persistence';
import { recordMalformedStorageEntry } from './storageRecovery';

export const PRIVACY_SETTINGS_STORAGE_KEY = 'attentionos.privacySettings.v1';

export interface PrivacySettings {
  readonly externalAiCallsAllowed: boolean;
  readonly localOnlyAcknowledged: boolean;
  readonly telemetryOptIn: boolean;
  readonly updatedAt: string | null;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  externalAiCallsAllowed: false,
  localOnlyAcknowledged: false,
  telemetryOptIn: false,
  updatedAt: null,
};

function isPrivacySettings(value: unknown): value is Partial<PrivacySettings> {
  return typeof value === 'object' && value !== null;
}

function booleanOrDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

export function readPrivacySettings(): PrivacySettings {
  const raw = localStorage.getItem(PRIVACY_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_PRIVACY_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isPrivacySettings(parsed)) {
      recordMalformedStorageEntry({
        error: new Error('Privacy settings are not an object.'),
        fallback: 'Using default privacy settings with external AI and telemetry off.',
        payload: raw,
        storageKey: PRIVACY_SETTINGS_STORAGE_KEY,
      });
      return DEFAULT_PRIVACY_SETTINGS;
    }

    return {
      externalAiCallsAllowed: booleanOrDefault(
        parsed.externalAiCallsAllowed,
        DEFAULT_PRIVACY_SETTINGS.externalAiCallsAllowed,
      ),
      localOnlyAcknowledged: booleanOrDefault(
        parsed.localOnlyAcknowledged,
        DEFAULT_PRIVACY_SETTINGS.localOnlyAcknowledged,
      ),
      telemetryOptIn: booleanOrDefault(
        parsed.telemetryOptIn,
        DEFAULT_PRIVACY_SETTINGS.telemetryOptIn,
      ),
      updatedAt: stringOrNull(parsed.updatedAt),
    };
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Using default privacy settings with external AI and telemetry off.',
      payload: raw,
      storageKey: PRIVACY_SETTINGS_STORAGE_KEY,
    });
    return DEFAULT_PRIVACY_SETTINGS;
  }
}

export function savePrivacySettings(settings: Omit<PrivacySettings, 'updatedAt'>): PrivacySettings {
  const nextSettings: PrivacySettings = {
    externalAiCallsAllowed: Boolean(settings.externalAiCallsAllowed),
    localOnlyAcknowledged: Boolean(settings.localOnlyAcknowledged),
    telemetryOptIn: Boolean(settings.telemetryOptIn),
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(PRIVACY_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  queuePersistAppState();

  return nextSettings;
}
