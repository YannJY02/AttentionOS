import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Download,
  ExternalLink,
  FileJson,
  MousePointerClick,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { downloadPortableAppState, readPortableAppStateFile } from '../adapters/portableAppState';
import { logReminderIntegrationSettingsChanged } from '../adapters/storage/audit';
import {
  clearPersistenceRecoveryIssue,
  createAppStateBackup,
  exportAppStateAsPortableFile,
  importAppStateFromPayload,
  persistCurrentAppState,
  readPersistenceRecoveryIssue,
} from '../adapters/storage/persistence';
import { readPrivacySettings, savePrivacySettings } from '../adapters/storage/privacySettings';
import {
  type ReminderIntegrationChannel,
  readReminderSettings,
  saveReminderSettings,
} from '../adapters/storage/reminderSettings';
import {
  RITUAL_CADENCE_OPTIONS,
  RITUAL_GUIDANCE_OPTIONS,
  RITUAL_SOUND_OPTIONS,
  type RitualCadenceMode,
  type RitualGuidanceMode,
  type RitualSoundMode,
  readRitualSettings,
  saveRitualSettings,
} from '../adapters/storage/ritualCopy';
import {
  clearAllStorageRecoveryIssues,
  readStorageRecoveryIssues,
  subscribeStorageRecoveryUpdates,
} from '../adapters/storage/storageRecovery';
import { AttentionCalibrationPanel } from './settings/AttentionCalibrationPanel';
import { IntegrationBoundaryPanel } from './settings/IntegrationBoundaryPanel';

export function SettingsPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [ritualForm, setRitualForm] = useState(() => {
    const settings = readRitualSettings();

    return {
      dedicationText: settings.dedicationText,
      durationMinutes: settings.meditation.durationMinutes.toString(),
      eveningTime: settings.schedule.eveningTime,
      guidanceMode: settings.meditation.guidanceMode,
      intentionText: settings.intentionText,
      manualEntryEnabled: settings.schedule.manualEntryEnabled,
      morningTime: settings.schedule.morningTime,
      cadenceMode: settings.schedule.cadenceMode,
      soundMode: settings.meditation.soundMode,
    };
  });
  const [privacyForm, setPrivacyForm] = useState(() => readPrivacySettings());
  const [reminderForm, setReminderForm] = useState(() => {
    const settings = readReminderSettings();

    return {
      frequencyMinutes: settings.frequencyMinutes.toString(),
      integrationAppAutoOpenTarget: settings.integration.appAutoOpenTarget ?? '',
      integrationAuditTrailEnabled: settings.integration.auditTrailEnabled,
      integrationChannels: [...settings.integration.channels],
      integrationDailyPromptLimit: settings.integration.dailyPromptLimit.toString(),
      integrationEnabled: settings.integration.enabled,
      integrationPermissionAccepted: settings.integration.permissionStatementAccepted,
      priorityOverrideEnabled: settings.priorityOverrideEnabled,
      quietHoursEnd: settings.quietHoursEnd,
      quietHoursStart: settings.quietHoursStart,
      remindersEnabled: settings.remindersEnabled,
    };
  });
  const [status, setStatus] = useState('Local-first data controls are ready.');
  const [recoveryIssue, setRecoveryIssue] = useState(() => readPersistenceRecoveryIssue());
  const [storageRecoveryIssues, setStorageRecoveryIssues] = useState(() =>
    readStorageRecoveryIssues(),
  );
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    function refreshStorageRecoveryIssues() {
      setStorageRecoveryIssues(readStorageRecoveryIssues());
    }

    return subscribeStorageRecoveryUpdates(refreshStorageRecoveryIssues);
  }, []);

  function saveRitualForm() {
    const saved = saveRitualSettings({
      dedicationText: ritualForm.dedicationText,
      intentionText: ritualForm.intentionText,
      meditation: {
        durationMinutes: Number(ritualForm.durationMinutes),
        guidanceMode: ritualForm.guidanceMode,
        soundMode: ritualForm.soundMode,
      },
      schedule: {
        cadenceMode: ritualForm.cadenceMode,
        eveningTime: ritualForm.eveningTime,
        manualEntryEnabled: ritualForm.manualEntryEnabled,
        morningTime: ritualForm.morningTime,
      },
    });

    setRitualForm({
      dedicationText: saved.dedicationText,
      durationMinutes: saved.meditation.durationMinutes.toString(),
      eveningTime: saved.schedule.eveningTime,
      guidanceMode: saved.meditation.guidanceMode,
      intentionText: saved.intentionText,
      manualEntryEnabled: saved.schedule.manualEntryEnabled,
      morningTime: saved.schedule.morningTime,
      cadenceMode: saved.schedule.cadenceMode,
      soundMode: saved.meditation.soundMode,
    });
    setStatus(`Ritual settings saved for a ${saved.meditation.durationMinutes} minute practice.`);
  }

  function savePrivacyForm() {
    const saved = savePrivacySettings({
      externalAiCallsAllowed: privacyForm.externalAiCallsAllowed,
      localOnlyAcknowledged: privacyForm.localOnlyAcknowledged,
      telemetryOptIn: privacyForm.telemetryOptIn,
    });

    setPrivacyForm(saved);
    setStatus(
      saved.telemetryOptIn
        ? 'Privacy settings saved. Telemetry is opt-in, but no telemetry client is active in this build.'
        : 'Privacy settings saved. Telemetry and external AI calls remain off by default.',
    );
  }

  function saveReminderForm() {
    const saved = saveReminderSettings({
      frequencyMinutes: Number(reminderForm.frequencyMinutes),
      integration: {
        appAutoOpenTarget: reminderForm.integrationAppAutoOpenTarget,
        auditTrailEnabled: reminderForm.integrationAuditTrailEnabled,
        channels: reminderForm.integrationChannels,
        dailyPromptLimit: Number(reminderForm.integrationDailyPromptLimit),
        enabled: reminderForm.integrationEnabled,
        permissionStatementAccepted: reminderForm.integrationPermissionAccepted,
      },
      priorityOverrideEnabled: reminderForm.priorityOverrideEnabled,
      quietHoursEnd: reminderForm.quietHoursEnd,
      quietHoursStart: reminderForm.quietHoursStart,
      remindersEnabled: reminderForm.remindersEnabled,
    });

    if (saved.integration.enabled) {
      logReminderIntegrationSettingsChanged({
        auditTrailEnabled: saved.integration.auditTrailEnabled,
        channels: saved.integration.channels,
        dailyPromptLimit: saved.integration.dailyPromptLimit,
        enabled: saved.integration.enabled,
        permissionStatementAccepted: saved.integration.permissionStatementAccepted,
      });
    }

    setReminderForm({
      frequencyMinutes: saved.frequencyMinutes.toString(),
      integrationAppAutoOpenTarget: saved.integration.appAutoOpenTarget ?? '',
      integrationAuditTrailEnabled: saved.integration.auditTrailEnabled,
      integrationChannels: [...saved.integration.channels],
      integrationDailyPromptLimit: saved.integration.dailyPromptLimit.toString(),
      integrationEnabled: saved.integration.enabled,
      integrationPermissionAccepted: saved.integration.permissionStatementAccepted,
      priorityOverrideEnabled: saved.priorityOverrideEnabled,
      quietHoursEnd: saved.quietHoursEnd,
      quietHoursStart: saved.quietHoursStart,
      remindersEnabled: saved.remindersEnabled,
    });
    setStatus(
      saved.integration.enabled
        ? `Integration reminder handoffs saved for ${saved.integration.channels.length} channel${saved.integration.channels.length === 1 ? '' : 's'} with a ${saved.integration.dailyPromptLimit}/day cap.`
        : saved.remindersEnabled
          ? `Reminder preferences saved for every ${saved.frequencyMinutes} minutes outside quiet hours.`
          : 'Reminder preferences saved. Native notifications remain off until explicitly enabled.',
    );
  }

  function toggleIntegrationChannel(channel: ReminderIntegrationChannel, checked: boolean) {
    setReminderForm((current) => {
      const channels = checked
        ? [...new Set([...current.integrationChannels, channel])]
        : current.integrationChannels.filter((candidate) => candidate !== channel);

      return {
        ...current,
        integrationChannels: channels,
      };
    });
  }

  async function syncNow() {
    setIsWorking(true);
    try {
      const result = await persistCurrentAppState();
      setStatus(`Saved ${result.bytes} bytes to ${result.backend} persistence.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save local data.');
    } finally {
      setIsWorking(false);
    }
  }

  async function createBackup() {
    setIsWorking(true);
    try {
      const result = await createAppStateBackup();
      setStatus(
        result.path
          ? `Backup created at ${result.path}.`
          : `Backup created in browser storage (${result.bytes} bytes).`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to create backup.');
    } finally {
      setIsWorking(false);
    }
  }

  async function exportJson() {
    setIsWorking(true);
    try {
      const result = await exportAppStateAsPortableFile();
      if (result.payload) {
        downloadPortableAppState(result.payload);
      }
      setStatus(
        result.path
          ? `Export saved at ${result.path}.`
          : `Export file prepared from the current local workspace (${result.bytes} bytes).`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to export local data.');
    } finally {
      setIsWorking(false);
    }
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsWorking(true);
    try {
      const payload = await readPortableAppStateFile(file);
      const snapshot = await importAppStateFromPayload(payload);
      clearRecoveryIssue();
      setStatus(`Imported AttentionOS backup from ${snapshot.exportedAt}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to import backup.');
    } finally {
      setIsWorking(false);
      event.target.value = '';
    }
  }

  function clearRecoveryIssue() {
    clearPersistenceRecoveryIssue();
    setRecoveryIssue(null);
  }

  function clearStorageRecoveryWarnings() {
    clearAllStorageRecoveryIssues();
    setStorageRecoveryIssues([]);
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="font-medium text-stone-500 text-sm">System</p>
        <h1 className="mt-2 font-semibold text-4xl text-stone-950">Data & Settings</h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600">
          Keep the personal context local, portable, and recoverable before enabling broader
          integrations.
        </p>
      </div>

      <section className="mt-5 rounded-md border border-stone-200 bg-white p-5">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 font-medium text-amber-700 text-sm">
            <Settings aria-hidden="true" size={16} />
            Ritual practice
          </p>
          <h2 className="mt-2 font-semibold text-2xl text-stone-950">
            Intention, meditation, and dedication
          </h2>
        </div>

        <div className="mt-6 grid gap-5">
          <label className="block font-medium text-sm text-stone-800" htmlFor="ritual-intention">
            Intention / prayer
            <textarea
              className="mt-2 min-h-24 w-full resize-y rounded-md border border-stone-300 bg-white p-3 font-normal text-sm text-stone-900 outline-none focus:border-amber-700"
              id="ritual-intention"
              onChange={(event) =>
                setRitualForm((current) => ({
                  ...current,
                  intentionText: event.target.value,
                }))
              }
              value={ritualForm.intentionText}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block font-medium text-sm text-stone-800" htmlFor="ritual-duration">
              Meditation duration
              <input
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-amber-700"
                id="ritual-duration"
                max={60}
                min={1}
                onChange={(event) =>
                  setRitualForm((current) => ({
                    ...current,
                    durationMinutes: event.target.value,
                  }))
                }
                type="number"
                value={ritualForm.durationMinutes}
              />
            </label>

            <label className="block font-medium text-sm text-stone-800" htmlFor="ritual-guidance">
              Guidance mode
              <select
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-amber-700"
                id="ritual-guidance"
                onChange={(event) =>
                  setRitualForm((current) => ({
                    ...current,
                    guidanceMode: event.target.value as RitualGuidanceMode,
                  }))
                }
                value={ritualForm.guidanceMode}
              >
                {RITUAL_GUIDANCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block font-medium text-sm text-stone-800" htmlFor="ritual-sound">
              Sound cue
              <select
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-amber-700"
                id="ritual-sound"
                onChange={(event) =>
                  setRitualForm((current) => ({
                    ...current,
                    soundMode: event.target.value as RitualSoundMode,
                  }))
                }
                value={ritualForm.soundMode}
              >
                {RITUAL_SOUND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem_10rem]">
            <label className="block font-medium text-sm text-stone-800" htmlFor="ritual-cadence">
              Ritual cadence
              <select
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-amber-700"
                id="ritual-cadence"
                onChange={(event) =>
                  setRitualForm((current) => ({
                    ...current,
                    cadenceMode: event.target.value as RitualCadenceMode,
                  }))
                }
                value={ritualForm.cadenceMode}
              >
                {RITUAL_CADENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block font-medium text-sm text-stone-800" htmlFor="ritual-morning">
              Morning ritual time
              <input
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-amber-700"
                id="ritual-morning"
                onChange={(event) =>
                  setRitualForm((current) => ({
                    ...current,
                    morningTime: event.target.value,
                  }))
                }
                type="time"
                value={ritualForm.morningTime}
              />
            </label>

            <label className="block font-medium text-sm text-stone-800" htmlFor="ritual-evening">
              Evening ritual time
              <input
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-amber-700"
                id="ritual-evening"
                onChange={(event) =>
                  setRitualForm((current) => ({
                    ...current,
                    eveningTime: event.target.value,
                  }))
                }
                type="time"
                value={ritualForm.eveningTime}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              checked={ritualForm.manualEntryEnabled}
              className="h-4 w-4 rounded border-stone-300 text-amber-700"
              onChange={(event) =>
                setRitualForm((current) => ({
                  ...current,
                  manualEntryEnabled: event.target.checked,
                }))
              }
              type="checkbox"
            />
            Manual ritual entry
          </label>

          <label className="block font-medium text-sm text-stone-800" htmlFor="ritual-dedication">
            Dedication / 回向
            <textarea
              className="mt-2 min-h-24 w-full resize-y rounded-md border border-stone-300 bg-white p-3 font-normal text-sm text-stone-900 outline-none focus:border-amber-700"
              id="ritual-dedication"
              onChange={(event) =>
                setRitualForm((current) => ({
                  ...current,
                  dedicationText: event.target.value,
                }))
              }
              value={ritualForm.dedicationText}
            />
          </label>
        </div>

        <button
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-amber-700 px-4 py-2 font-medium text-sm text-white"
          onClick={saveRitualForm}
          type="button"
        >
          <Save aria-hidden="true" size={16} />
          Save ritual settings
        </button>
      </section>

      <section className="mt-5 rounded-md border border-stone-200 bg-white p-5">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 font-medium text-emerald-700 text-sm">
            <ShieldCheck aria-hidden="true" size={16} />
            Privacy & AI
          </p>
          <h2 className="mt-2 font-semibold text-2xl text-stone-950">Local-first boundaries</h2>
          <p className="mt-2 text-sm text-stone-600">
            AttentionOS keeps workspace data local unless you export it or explicitly authorize a
            future integration.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="flex items-start gap-3 rounded-md border border-stone-200 p-4 text-sm text-stone-700">
            <input
              checked={privacyForm.localOnlyAcknowledged}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-700"
              onChange={(event) =>
                setPrivacyForm((current) => ({
                  ...current,
                  localOnlyAcknowledged: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span>
              <span className="block font-medium text-stone-900">
                I understand workspace data stays local on this Mac unless I export it.
              </span>
              <span className="mt-1 block text-stone-600">
                Backups and exported JSON files are user-controlled files, not cloud sync.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-md border border-stone-200 p-4 text-sm text-stone-700">
            <input
              checked={privacyForm.externalAiCallsAllowed}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-700"
              onChange={(event) =>
                setPrivacyForm((current) => ({
                  ...current,
                  externalAiCallsAllowed: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span>
              <span className="block font-medium text-stone-900">
                Permit future external AI calls only after explicit provider setup.
              </span>
              <span className="mt-1 block text-stone-600">
                This build has no stored provider credentials and does not create external AI calls
                from this switch alone.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-md border border-stone-200 p-4 text-sm text-stone-700">
            <input
              checked={privacyForm.telemetryOptIn}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-700"
              onChange={(event) =>
                setPrivacyForm((current) => ({
                  ...current,
                  telemetryOptIn: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span>
              <span className="block font-medium text-stone-900">
                Allow future anonymous product telemetry.
              </span>
              <span className="mt-1 block text-stone-600">
                Telemetry remains off by default; this build has no active telemetry sender.
              </span>
            </span>
          </label>
        </div>

        <button
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 font-medium text-sm text-white"
          onClick={savePrivacyForm}
          type="button"
        >
          <Save aria-hidden="true" size={16} />
          Save privacy settings
        </button>
      </section>

      <section className="mt-5 rounded-md border border-stone-200 bg-white p-5">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 font-medium text-sky-700 text-sm">
            <Bell aria-hidden="true" size={16} />
            Reminder consent
          </p>
          <h2 className="mt-2 font-semibold text-2xl text-stone-950">
            Frequency and quiet windows
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Configure reminder intent before any future native notification permission request.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="flex items-start gap-3 rounded-md border border-stone-200 p-4 text-sm text-stone-700">
            <input
              checked={reminderForm.remindersEnabled}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-sky-700"
              onChange={(event) =>
                setReminderForm((current) => ({
                  ...current,
                  remindersEnabled: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span>
              <span className="block font-medium text-stone-900">
                Enable AttentionOS reminder preferences.
              </span>
              <span className="mt-1 block text-stone-600">
                This stores local preferences only; it does not request macOS notification
                permission or schedule background notifications in this build.
              </span>
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label
              className="block font-medium text-sm text-stone-800"
              htmlFor="reminder-frequency"
            >
              Reminder frequency
              <input
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-sky-700"
                id="reminder-frequency"
                max={240}
                min={15}
                onChange={(event) =>
                  setReminderForm((current) => ({
                    ...current,
                    frequencyMinutes: event.target.value,
                  }))
                }
                step={15}
                type="number"
                value={reminderForm.frequencyMinutes}
              />
            </label>

            <label className="block font-medium text-sm text-stone-800" htmlFor="quiet-hours-start">
              Quiet hours start
              <input
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-sky-700"
                id="quiet-hours-start"
                onChange={(event) =>
                  setReminderForm((current) => ({
                    ...current,
                    quietHoursStart: event.target.value,
                  }))
                }
                type="time"
                value={reminderForm.quietHoursStart}
              />
            </label>

            <label className="block font-medium text-sm text-stone-800" htmlFor="quiet-hours-end">
              Quiet hours end
              <input
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-sky-700"
                id="quiet-hours-end"
                onChange={(event) =>
                  setReminderForm((current) => ({
                    ...current,
                    quietHoursEnd: event.target.value,
                  }))
                }
                type="time"
                value={reminderForm.quietHoursEnd}
              />
            </label>
          </div>

          <label className="flex items-start gap-3 rounded-md border border-stone-200 p-4 text-sm text-stone-700">
            <input
              checked={reminderForm.priorityOverrideEnabled}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-sky-700"
              onChange={(event) =>
                setReminderForm((current) => ({
                  ...current,
                  priorityOverrideEnabled: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span>
              <span className="block font-medium text-stone-900">
                Allow priority overrides for active focus recovery.
              </span>
              <span className="mt-1 block text-stone-600">
                Priority overrides are saved as local intent only until native notification behavior
                is explicitly implemented and reviewed.
              </span>
            </span>
          </label>

          <fieldset className="rounded-md border border-sky-200 bg-sky-50/60 p-4">
            <legend className="inline-flex items-center gap-2 font-medium text-sky-800 text-sm">
              <ExternalLink aria-hidden="true" size={16} />
              Integration reminder handoffs
            </legend>
            <div className="max-w-2xl">
              <h3 className="mt-2 font-semibold text-lg text-stone-950">
                External reminders stay explicit and local
              </h3>
              <p className="mt-2 text-sm text-stone-600">
                These handoffs prepare calendar, Focus, or app-opening reminder intents without
                reading calendars, monitoring apps, or opening external software in the background.
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="flex items-start gap-3 rounded-md border border-sky-100 bg-white p-3 text-sm text-stone-700">
                <input
                  checked={reminderForm.integrationEnabled}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-sky-700"
                  onChange={(event) =>
                    setReminderForm((current) => ({
                      ...current,
                      integrationEnabled: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                <span>
                  <span className="block font-medium text-stone-900">
                    Enable integration reminder handoffs.
                  </span>
                  <span className="mt-1 block text-stone-600">
                    Handoffs stay pending until a human uses them; no OS notification, calendar
                    write, Focus change, or external app launch happens automatically.
                  </span>
                </span>
              </label>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="flex items-start gap-3 rounded-md border border-sky-100 bg-white p-3 text-sm text-stone-700">
                  <input
                    checked={reminderForm.integrationChannels.includes('calendar-file')}
                    className="mt-0.5 h-4 w-4 rounded border-stone-300 text-sky-700"
                    onChange={(event) =>
                      toggleIntegrationChannel('calendar-file', event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>
                    <span className="inline-flex items-center gap-2 font-medium text-stone-900">
                      <CalendarDays aria-hidden="true" size={15} />
                      Calendar file
                    </span>
                    <span className="mt-1 block text-stone-600">
                      Prepare a user-controlled calendar handoff instead of reading calendar data.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-md border border-sky-100 bg-white p-3 text-sm text-stone-700">
                  <input
                    checked={reminderForm.integrationChannels.includes('focus-handoff')}
                    className="mt-0.5 h-4 w-4 rounded border-stone-300 text-sky-700"
                    onChange={(event) =>
                      toggleIntegrationChannel('focus-handoff', event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>
                    <span className="inline-flex items-center gap-2 font-medium text-stone-900">
                      <MousePointerClick aria-hidden="true" size={15} />
                      Focus handoff
                    </span>
                    <span className="mt-1 block text-stone-600">
                      Keep a visible Focus-mode prompt without changing macOS Focus settings.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-md border border-sky-100 bg-white p-3 text-sm text-stone-700">
                  <input
                    checked={reminderForm.integrationChannels.includes('app-auto-open')}
                    className="mt-0.5 h-4 w-4 rounded border-stone-300 text-sky-700"
                    onChange={(event) =>
                      toggleIntegrationChannel('app-auto-open', event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>
                    <span className="inline-flex items-center gap-2 font-medium text-stone-900">
                      <ExternalLink aria-hidden="true" size={15} />
                      App auto-open
                    </span>
                    <span className="mt-1 block text-stone-600">
                      Store a target for a future user-triggered open action; background launch is
                      off.
                    </span>
                  </span>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem]">
                <label
                  className="block font-medium text-sm text-stone-800"
                  htmlFor="integration-auto-open-target"
                >
                  Auto-open target
                  <input
                    className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-sky-700"
                    id="integration-auto-open-target"
                    onChange={(event) =>
                      setReminderForm((current) => ({
                        ...current,
                        integrationAppAutoOpenTarget: event.target.value,
                      }))
                    }
                    placeholder="Calendar, Things, raycast://..."
                    value={reminderForm.integrationAppAutoOpenTarget}
                  />
                </label>

                <label
                  className="block font-medium text-sm text-stone-800"
                  htmlFor="integration-daily-limit"
                >
                  Daily cap
                  <input
                    className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-sky-700"
                    id="integration-daily-limit"
                    max={6}
                    min={1}
                    onChange={(event) =>
                      setReminderForm((current) => ({
                        ...current,
                        integrationDailyPromptLimit: event.target.value,
                      }))
                    }
                    type="number"
                    value={reminderForm.integrationDailyPromptLimit}
                  />
                </label>
              </div>

              <label className="flex items-start gap-3 rounded-md border border-sky-100 bg-white p-3 text-sm text-stone-700">
                <input
                  checked={reminderForm.integrationPermissionAccepted}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-sky-700"
                  onChange={(event) =>
                    setReminderForm((current) => ({
                      ...current,
                      integrationPermissionAccepted: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                <span>
                  <span className="block font-medium text-stone-900">
                    I understand integration reminders require explicit review before external
                    action.
                  </span>
                  <span className="mt-1 block text-stone-600">
                    The app records this intent locally and keeps future external actions auditable
                    and reversible where the external system allows it.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-md border border-sky-100 bg-white p-3 text-sm text-stone-700">
                <input
                  checked={reminderForm.integrationAuditTrailEnabled}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-sky-700"
                  onChange={(event) =>
                    setReminderForm((current) => ({
                      ...current,
                      integrationAuditTrailEnabled: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                <span>
                  <span className="block font-medium text-stone-900">
                    Keep an audit entry when integration reminder settings change.
                  </span>
                  <span className="mt-1 block text-stone-600">
                    Audit entries stay in the local AttentionOS snapshot and export.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        <button
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 font-medium text-sm text-white"
          onClick={saveReminderForm}
          type="button"
        >
          <Save aria-hidden="true" size={16} />
          Save reminder settings
        </button>
      </section>

      <AttentionCalibrationPanel />

      <IntegrationBoundaryPanel />

      {recoveryIssue ? (
        <section
          className="mt-5 rounded-md border border-amber-300 bg-amber-50 p-5 text-amber-950"
          role="alert"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 font-medium text-amber-800 text-sm">
                <AlertTriangle aria-hidden="true" size={16} />
                Recovery state
              </p>
              <h2 className="mt-2 font-semibold text-xl">Saved workspace was quarantined</h2>
              <p className="mt-2 text-sm leading-6">
                AttentionOS could not restore a previous local snapshot. The original payload was
                preserved before the app continued with the current local state.
              </p>
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-md border border-amber-300 px-3 py-2 font-medium text-amber-950 text-sm"
              onClick={clearRecoveryIssue}
              type="button"
            >
              <XCircle aria-hidden="true" size={16} />
              Clear warning
            </button>
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium">Backend</dt>
              <dd className="mt-1">{recoveryIssue.backend}</dd>
            </div>
            <div>
              <dt className="font-medium">Detected</dt>
              <dd className="mt-1">{recoveryIssue.detectedAt}</dd>
            </div>
            <div>
              <dt className="font-medium">Original size</dt>
              <dd className="mt-1">{recoveryIssue.originalBytes} bytes</dd>
            </div>
            <div>
              <dt className="font-medium">Reason</dt>
              <dd className="mt-1">{recoveryIssue.message}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium">Preserved copy</dt>
              <dd className="mt-1 break-all">
                {recoveryIssue.quarantinePath ?? 'Browser recovery storage'}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      {storageRecoveryIssues.length > 0 ? (
        <section
          className="mt-5 rounded-md border border-amber-300 bg-amber-50 p-5 text-amber-950"
          role="alert"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 font-medium text-amber-800 text-sm">
                <AlertTriangle aria-hidden="true" size={16} />
                Storage recovery
              </p>
              <h2 className="mt-2 font-semibold text-xl">Local storage recovered safely</h2>
              <p className="mt-2 text-sm leading-6">
                AttentionOS found malformed local settings or workflow entries. The original
                payloads were preserved before the app used safe defaults for this session.
              </p>
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-md border border-amber-300 px-3 py-2 font-medium text-amber-950 text-sm"
              onClick={clearStorageRecoveryWarnings}
              type="button"
            >
              <XCircle aria-hidden="true" size={16} />
              Clear storage warnings
            </button>
          </div>

          <div className="mt-4 grid gap-3 text-sm">
            {storageRecoveryIssues.map((issue) => (
              <article
                className="rounded-md border border-amber-200 bg-white/70 p-3"
                key={issue.storageKey}
              >
                <h3 className="font-medium">{issue.storageKey}</h3>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium">Fallback</dt>
                    <dd className="mt-1">{issue.fallback}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Detected</dt>
                    <dd className="mt-1">{issue.detectedAt}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Original size</dt>
                    <dd className="mt-1">{issue.originalBytes} bytes</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Reason</dt>
                    <dd className="mt-1">{issue.message}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-5 rounded-md border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 font-medium text-emerald-700 text-sm">
              <FileJson aria-hidden="true" size={16} />
              Local workspace data
            </p>
            <h2 className="mt-2 font-semibold text-2xl text-stone-950">
              Backup, export, and restore
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              The current release-candidate slice mirrors app state into a local snapshot and lets
              you create a backup before larger workflow changes.
            </p>
          </div>

          <p className="rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-700" role="status">
            {status}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2 font-medium text-sm text-white disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={isWorking}
            onClick={syncNow}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={16} />
            Save snapshot
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isWorking}
            onClick={createBackup}
            type="button"
          >
            <FileJson aria-hidden="true" size={16} />
            Create backup
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800"
            disabled={isWorking}
            onClick={exportJson}
            type="button"
          >
            <Download aria-hidden="true" size={16} />
            Export JSON
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isWorking}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <Upload aria-hidden="true" size={16} />
            Import JSON
          </button>
          <input
            accept="application/json"
            aria-label="Import AttentionOS JSON backup"
            className="sr-only"
            onChange={importJson}
            ref={inputRef}
            type="file"
          />
        </div>

        <section
          aria-labelledby="backup-rotation-heading"
          className="mt-6 grid gap-3 border-stone-200 border-t pt-5 text-sm md:grid-cols-4"
        >
          <h3 className="sr-only" id="backup-rotation-heading">
            Backup rotation and export locations
          </h3>
          <div>
            <h3 className="font-medium text-stone-950">Snapshot</h3>
            <p className="mt-1 text-stone-600">
              Current recovery copy, replaced whenever the workspace is saved.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-stone-950">Backup</h3>
            <p className="mt-1 text-stone-600">
              Dated copy in app data; create one before imports or larger workflow edits.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-stone-950">Export</h3>
            <p className="mt-1 text-stone-600">
              Portable JSON file for owner-controlled storage outside AttentionOS.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-stone-950">Restore</h3>
            <p className="mt-1 text-stone-600">
              Validated JSON import; malformed entries are rejected before mutation.
            </p>
          </div>
        </section>
      </section>

      <section className="mt-5 rounded-md border border-stone-200 bg-white p-5">
        <p className="inline-flex items-center gap-2 font-medium text-stone-500 text-sm">
          <Settings aria-hidden="true" size={16} />
          Release-candidate boundary
        </p>
        <p className="mt-2 text-sm text-stone-600">
          Cloud sync, Apple signing, notarization, and App Store upload remain outside this local
          control surface until the owner authorizes those external steps.
        </p>
      </section>
    </section>
  );
}
