import { queuePersistAppState } from './persistence';
import { recordMalformedStorageEntry } from './storageRecovery';

export const RITUAL_COPY_STORAGE_KEY = 'attentionos.ritualCopy.v1';
export const RITUAL_MEDITATION_SETTINGS_STORAGE_KEY = 'attentionos.ritualMeditationSettings.v1';
export const RITUAL_SCHEDULE_SETTINGS_STORAGE_KEY = 'attentionos.ritualScheduleSettings.v1';

export interface RitualCopy {
  readonly intentionText: string;
  readonly dedicationText: string;
}

export type RitualGuidanceMode = 'breath' | 'body_scan' | 'silent';
export type RitualSoundMode = 'bell' | 'none';
export type RitualCadenceMode = 'morning_evening' | 'morning' | 'evening' | 'manual';

export interface RitualMeditationSettings {
  readonly durationMinutes: number;
  readonly guidanceMode: RitualGuidanceMode;
  readonly soundMode: RitualSoundMode;
}

export interface RitualScheduleSettings {
  readonly cadenceMode: RitualCadenceMode;
  readonly eveningTime: string;
  readonly manualEntryEnabled: boolean;
  readonly morningTime: string;
}

export interface RitualSettings extends RitualCopy {
  readonly meditation: RitualMeditationSettings;
  readonly schedule: RitualScheduleSettings;
}

export const DEFAULT_RITUAL_COPY: RitualCopy = {
  intentionText:
    'Settle your attention and name the intention you want to carry into the next work block.',
  dedicationText:
    'Dedicate this session to the work that matters, then step into the wider view when you are ready.',
};

export const DEFAULT_RITUAL_MEDITATION_SETTINGS: RitualMeditationSettings = {
  durationMinutes: 5,
  guidanceMode: 'breath',
  soundMode: 'bell',
};

export const DEFAULT_RITUAL_SCHEDULE_SETTINGS: RitualScheduleSettings = {
  cadenceMode: 'morning_evening',
  eveningTime: '21:30',
  manualEntryEnabled: true,
  morningTime: '08:30',
};

export const RITUAL_CADENCE_OPTIONS: readonly {
  readonly label: string;
  readonly value: RitualCadenceMode;
}[] = [
  { label: 'Morning and evening', value: 'morning_evening' },
  { label: 'Morning only', value: 'morning' },
  { label: 'Evening only', value: 'evening' },
  { label: 'Manual only', value: 'manual' },
] as const;

export const RITUAL_GUIDANCE_OPTIONS: readonly {
  readonly label: string;
  readonly prompt: string;
  readonly value: RitualGuidanceMode;
}[] = [
  {
    label: 'Breath count',
    prompt: 'Count one steady breath at a time. When attention wanders, return to the next breath.',
    value: 'breath',
  },
  {
    label: 'Body scan',
    prompt: 'Notice the body from head to hands, then settle attention before choosing the day.',
    value: 'body_scan',
  },
  {
    label: 'Silent sitting',
    prompt: 'Sit quietly with the intention visible. Let the timer hold the boundary.',
    value: 'silent',
  },
] as const;

export const RITUAL_SOUND_OPTIONS: readonly {
  readonly label: string;
  readonly value: RitualSoundMode;
}[] = [
  { label: 'Opening and closing bell', value: 'bell' },
  { label: 'No sound cue', value: 'none' },
] as const;

function isRitualCopy(value: unknown): value is Partial<RitualCopy> {
  return typeof value === 'object' && value !== null;
}

function isRitualMeditationSettings(value: unknown): value is Partial<RitualMeditationSettings> {
  return typeof value === 'object' && value !== null;
}

function isRitualScheduleSettings(value: unknown): value is Partial<RitualScheduleSettings> {
  return typeof value === 'object' && value !== null;
}

function sanitizeDurationMinutes(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_RITUAL_MEDITATION_SETTINGS.durationMinutes;
  }

  return Math.min(60, Math.max(1, Math.round(parsed)));
}

function sanitizeGuidanceMode(value: unknown): RitualGuidanceMode {
  return RITUAL_GUIDANCE_OPTIONS.some((option) => option.value === value)
    ? (value as RitualGuidanceMode)
    : DEFAULT_RITUAL_MEDITATION_SETTINGS.guidanceMode;
}

function sanitizeSoundMode(value: unknown): RitualSoundMode {
  return RITUAL_SOUND_OPTIONS.some((option) => option.value === value)
    ? (value as RitualSoundMode)
    : DEFAULT_RITUAL_MEDITATION_SETTINGS.soundMode;
}

function sanitizeCadenceMode(value: unknown): RitualCadenceMode {
  return RITUAL_CADENCE_OPTIONS.some((option) => option.value === value)
    ? (value as RitualCadenceMode)
    : DEFAULT_RITUAL_SCHEDULE_SETTINGS.cadenceMode;
}

function sanitizeTime(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  return /^\d{2}:\d{2}$/.test(value) ? value : fallback;
}

function readConfiguredCopy(): Partial<RitualCopy> {
  const raw = localStorage.getItem(RITUAL_COPY_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (isRitualCopy(parsed)) {
      return parsed;
    }

    recordMalformedStorageEntry({
      error: new Error('Ritual copy settings are not an object.'),
      fallback: 'Using default Ritual intention and dedication copy.',
      payload: raw,
      storageKey: RITUAL_COPY_STORAGE_KEY,
    });
    return {};
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Using default Ritual intention and dedication copy.',
      payload: raw,
      storageKey: RITUAL_COPY_STORAGE_KEY,
    });
    return {};
  }
}

function readConfiguredMeditationSettings(): Partial<RitualMeditationSettings> {
  const raw = localStorage.getItem(RITUAL_MEDITATION_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (isRitualMeditationSettings(parsed)) {
      return parsed;
    }

    recordMalformedStorageEntry({
      error: new Error('Ritual meditation settings are not an object.'),
      fallback: 'Using default meditation duration, guidance, and sound settings.',
      payload: raw,
      storageKey: RITUAL_MEDITATION_SETTINGS_STORAGE_KEY,
    });
    return {};
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Using default meditation duration, guidance, and sound settings.',
      payload: raw,
      storageKey: RITUAL_MEDITATION_SETTINGS_STORAGE_KEY,
    });
    return {};
  }
}

function readConfiguredScheduleSettings(): Partial<RitualScheduleSettings> {
  const raw = localStorage.getItem(RITUAL_SCHEDULE_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (isRitualScheduleSettings(parsed)) {
      return parsed;
    }

    recordMalformedStorageEntry({
      error: new Error('Ritual schedule settings are not an object.'),
      fallback: 'Using default morning/evening Ritual schedule settings.',
      payload: raw,
      storageKey: RITUAL_SCHEDULE_SETTINGS_STORAGE_KEY,
    });
    return {};
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Using default morning/evening Ritual schedule settings.',
      payload: raw,
      storageKey: RITUAL_SCHEDULE_SETTINGS_STORAGE_KEY,
    });
    return {};
  }
}

export function readRitualCopy(): RitualCopy {
  const configuredCopy = readConfiguredCopy();

  return {
    intentionText:
      typeof configuredCopy.intentionText === 'string' && configuredCopy.intentionText.trim()
        ? configuredCopy.intentionText.trim()
        : DEFAULT_RITUAL_COPY.intentionText,
    dedicationText:
      typeof configuredCopy.dedicationText === 'string' && configuredCopy.dedicationText.trim()
        ? configuredCopy.dedicationText.trim()
        : DEFAULT_RITUAL_COPY.dedicationText,
  };
}

export function readRitualMeditationSettings(): RitualMeditationSettings {
  const configuredSettings = readConfiguredMeditationSettings();

  return {
    durationMinutes: sanitizeDurationMinutes(configuredSettings.durationMinutes),
    guidanceMode: sanitizeGuidanceMode(configuredSettings.guidanceMode),
    soundMode: sanitizeSoundMode(configuredSettings.soundMode),
  };
}

export function readRitualScheduleSettings(): RitualScheduleSettings {
  const configuredSettings = readConfiguredScheduleSettings();

  return {
    cadenceMode: sanitizeCadenceMode(configuredSettings.cadenceMode),
    eveningTime: sanitizeTime(
      configuredSettings.eveningTime,
      DEFAULT_RITUAL_SCHEDULE_SETTINGS.eveningTime,
    ),
    manualEntryEnabled:
      typeof configuredSettings.manualEntryEnabled === 'boolean'
        ? configuredSettings.manualEntryEnabled
        : DEFAULT_RITUAL_SCHEDULE_SETTINGS.manualEntryEnabled,
    morningTime: sanitizeTime(
      configuredSettings.morningTime,
      DEFAULT_RITUAL_SCHEDULE_SETTINGS.morningTime,
    ),
  };
}

export function readRitualSettings(): RitualSettings {
  return {
    ...readRitualCopy(),
    meditation: readRitualMeditationSettings(),
    schedule: readRitualScheduleSettings(),
  };
}

export function getRitualGuidancePrompt(mode: RitualGuidanceMode): string {
  return (
    RITUAL_GUIDANCE_OPTIONS.find((option) => option.value === mode)?.prompt ??
    RITUAL_GUIDANCE_OPTIONS[0].prompt
  );
}

export function getRitualGuidanceLabel(mode: RitualGuidanceMode): string {
  return (
    RITUAL_GUIDANCE_OPTIONS.find((option) => option.value === mode)?.label ??
    RITUAL_GUIDANCE_OPTIONS[0].label
  );
}

export function getRitualSoundLabel(mode: RitualSoundMode): string {
  return (
    RITUAL_SOUND_OPTIONS.find((option) => option.value === mode)?.label ??
    RITUAL_SOUND_OPTIONS[0].label
  );
}

export function getRitualCadenceLabel(mode: RitualCadenceMode): string {
  return (
    RITUAL_CADENCE_OPTIONS.find((option) => option.value === mode)?.label ??
    RITUAL_CADENCE_OPTIONS[0].label
  );
}

export function formatRitualScheduleSummary(settings: RitualScheduleSettings): string {
  const cadenceLabel = getRitualCadenceLabel(settings.cadenceMode);
  const scheduleTimes =
    settings.cadenceMode === 'morning'
      ? settings.morningTime
      : settings.cadenceMode === 'evening'
        ? settings.eveningTime
        : settings.cadenceMode === 'manual'
          ? 'manual entry'
          : `${settings.morningTime} / ${settings.eveningTime}`;

  return `${cadenceLabel} ritual cadence · ${scheduleTimes}${
    settings.manualEntryEnabled ? ' · manual entry enabled' : ''
  }`;
}

export function saveRitualSettings(settings: RitualSettings): RitualSettings {
  const nextCopy: RitualCopy = {
    intentionText: settings.intentionText.trim() || DEFAULT_RITUAL_COPY.intentionText,
    dedicationText: settings.dedicationText.trim() || DEFAULT_RITUAL_COPY.dedicationText,
  };
  const nextMeditationSettings: RitualMeditationSettings = {
    durationMinutes: sanitizeDurationMinutes(settings.meditation.durationMinutes),
    guidanceMode: sanitizeGuidanceMode(settings.meditation.guidanceMode),
    soundMode: sanitizeSoundMode(settings.meditation.soundMode),
  };
  const nextScheduleSettings: RitualScheduleSettings = {
    cadenceMode: sanitizeCadenceMode(settings.schedule.cadenceMode),
    eveningTime: sanitizeTime(
      settings.schedule.eveningTime,
      DEFAULT_RITUAL_SCHEDULE_SETTINGS.eveningTime,
    ),
    manualEntryEnabled: settings.schedule.manualEntryEnabled,
    morningTime: sanitizeTime(
      settings.schedule.morningTime,
      DEFAULT_RITUAL_SCHEDULE_SETTINGS.morningTime,
    ),
  };

  localStorage.setItem(RITUAL_COPY_STORAGE_KEY, JSON.stringify(nextCopy));
  localStorage.setItem(
    RITUAL_MEDITATION_SETTINGS_STORAGE_KEY,
    JSON.stringify(nextMeditationSettings),
  );
  localStorage.setItem(RITUAL_SCHEDULE_SETTINGS_STORAGE_KEY, JSON.stringify(nextScheduleSettings));
  queuePersistAppState();

  return {
    ...nextCopy,
    meditation: nextMeditationSettings,
    schedule: nextScheduleSettings,
  };
}
