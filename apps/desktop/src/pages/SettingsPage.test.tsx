import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { EXECUTION_AUDIT_STORAGE_KEY } from '../storage/audit';
import { LEARNING_OBSERVATIONS_STORAGE_KEY } from '../storage/learning';
import {
  APP_STATE_RECOVERY_STORAGE_KEY,
  APP_STATE_SNAPSHOT_STORAGE_KEY,
} from '../storage/persistence';
import { PRIVACY_SETTINGS_STORAGE_KEY } from '../storage/privacySettings';
import { REMINDER_SETTINGS_STORAGE_KEY } from '../storage/reminderSettings';
import {
  RITUAL_COPY_STORAGE_KEY,
  RITUAL_MEDITATION_SETTINGS_STORAGE_KEY,
  RITUAL_SCHEDULE_SETTINGS_STORAGE_KEY,
} from '../storage/ritualCopy';
import {
  STORAGE_RECOVERY_ISSUES_STORAGE_KEY,
  STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY,
} from '../storage/storageRecovery';

describe('SettingsPage data controls', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps settings outside workflow stage redirects', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /data & settings/i })).toBeInTheDocument();
    expect(screen.getByText(/local-first data controls are ready/i)).toBeInTheDocument();
  });

  it('lets the user save a portable local snapshot', async () => {
    localStorage.setItem('attentionos.hierarchy.v1', '[{"id":"task-1"}]');

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /save snapshot/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/saved/i);
    });
    expect(localStorage.getItem(APP_STATE_SNAPSHOT_STORAGE_KEY)).toContain('task-1');
  });

  it('shows backup rotation and export location guidance', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    );

    const guidance = await screen.findByLabelText(/backup rotation and export locations/i);

    expect(guidance).toHaveTextContent(/current recovery copy/i);
    expect(guidance).toHaveTextContent(/dated copy in app data/i);
    expect(guidance).toHaveTextContent(/portable json file/i);
    expect(guidance).toHaveTextContent(/rejected before mutation/i);
  });

  it('shows and clears preserved corrupt snapshot recovery state', async () => {
    localStorage.setItem(
      APP_STATE_RECOVERY_STORAGE_KEY,
      JSON.stringify({
        backend: 'browser',
        detectedAt: '2026-05-23T10:00:00.000Z',
        message: 'Unexpected token in JSON',
        originalBytes: 14,
        quarantined: true,
      }),
    );

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: /saved workspace was quarantined/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/browser recovery storage/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear warning/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /saved workspace was quarantined/i }),
      ).not.toBeInTheDocument();
    });
    expect(localStorage.getItem(APP_STATE_RECOVERY_STORAGE_KEY)).toBeNull();
  });

  it('shows and clears preserved malformed local storage recovery issues', async () => {
    localStorage.setItem(PRIVACY_SETTINGS_STORAGE_KEY, '{broken');

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: /local storage recovered safely/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(PRIVACY_SETTINGS_STORAGE_KEY).length).toBeGreaterThanOrEqual(1);
    expect(localStorage.getItem(STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY)).toContain('{broken');

    fireEvent.click(screen.getAllByRole('button', { name: /clear storage warnings/i })[0]);

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /local storage recovered safely/i }),
      ).not.toBeInTheDocument();
    });
    expect(localStorage.getItem(STORAGE_RECOVERY_ISSUES_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY)).toBeNull();
  });

  it('saves privacy and AI boundary settings into the portable snapshot', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(
      await screen.findByLabelText(/workspace data stays local on this mac unless i export it/i),
    );
    fireEvent.click(screen.getByLabelText(/future external ai calls/i));
    fireEvent.click(screen.getByRole('button', { name: /save privacy settings/i }));

    expect(JSON.parse(localStorage.getItem(PRIVACY_SETTINGS_STORAGE_KEY) ?? '{}')).toMatchObject({
      externalAiCallsAllowed: true,
      localOnlyAcknowledged: true,
      telemetryOptIn: false,
      updatedAt: expect.any(String),
    });
    expect(screen.getByRole('status')).toHaveTextContent(/privacy settings saved/i);

    await waitFor(() => {
      expect(localStorage.getItem(APP_STATE_SNAPSHOT_STORAGE_KEY)).toContain(
        'externalAiCallsAllowed',
      );
    });
  });

  it('saves reminder consent boundaries into the portable snapshot', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByLabelText(/enable attentionos reminder preferences/i));
    fireEvent.change(screen.getByLabelText(/reminder frequency/i), {
      target: { value: '45' },
    });
    fireEvent.change(screen.getByLabelText(/quiet hours start/i), {
      target: { value: '22:15' },
    });
    fireEvent.change(screen.getByLabelText(/quiet hours end/i), {
      target: { value: '07:30' },
    });
    fireEvent.click(screen.getByLabelText(/allow priority overrides/i));
    fireEvent.click(screen.getByLabelText(/enable integration reminder handoffs/i));
    fireEvent.click(screen.getByLabelText(/app auto-open/i));
    fireEvent.change(screen.getByLabelText(/auto-open target/i), {
      target: { value: 'raycast://extensions/calendar' },
    });
    fireEvent.change(screen.getByLabelText(/daily cap/i), {
      target: { value: '4' },
    });
    fireEvent.click(
      screen.getByLabelText(
        /integration reminders require explicit review before external action/i,
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: /save reminder settings/i }));

    expect(JSON.parse(localStorage.getItem(REMINDER_SETTINGS_STORAGE_KEY) ?? '{}')).toMatchObject({
      frequencyMinutes: 45,
      integration: expect.objectContaining({
        appAutoOpenTarget: 'raycast://extensions/calendar',
        channels: expect.arrayContaining(['calendar-file', 'focus-handoff', 'app-auto-open']),
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
    expect(screen.getByRole('status')).toHaveTextContent(/integration reminder handoffs saved/i);
    expect(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY)).toContain(
      'reminder.integration.settings.changed',
    );

    await waitFor(() => {
      expect(localStorage.getItem(APP_STATE_SNAPSHOT_STORAGE_KEY)).toContain(
        'attentionos.reminderSettings.v1',
      );
    });
  });

  it('saves attention calibration with user correction into local learning observations', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: /correct the local attention estimate/i }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/correction/i), {
      target: { value: 'overloaded' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save attention calibration/i }));

    await waitFor(() => {
      expect(screen.getByText(/attention calibration saved as overloaded/i)).toBeInTheDocument();
    });

    expect(JSON.parse(localStorage.getItem(LEARNING_OBSERVATIONS_STORAGE_KEY) ?? '[]')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          breakdown: expect.objectContaining({
            behavioralScore: expect.any(Number),
            passiveScore: expect.any(Number),
            subjectiveScore: expect.any(Number),
          }),
          reasons: expect.arrayContaining([expect.stringMatching(/user corrected estimate/i)]),
          state: 'overloaded',
        }),
      ]),
    );
    expect(localStorage.getItem(APP_STATE_SNAPSHOT_STORAGE_KEY)).toContain(
      LEARNING_OBSERVATIONS_STORAGE_KEY,
    );
  });

  it('shows the no-surveillance integration boundary', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    );

    const boundary = await screen.findByRole('region', { name: /integration boundary/i });

    expect(boundary).toHaveTextContent(/does not monitor apps/i);
    expect(boundary).toHaveTextContent(/plugin, api, or auto-open capabilities/i);
    expect(boundary).toHaveTextContent(/manual capture/i);
    expect(boundary).toHaveTextContent(/user-approved, and auditable/i);
  });

  it('saves ritual copy and meditation settings into the portable snapshot', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.change(await screen.findByLabelText(/intention/i), {
      target: { value: 'Start with one patient breath.' },
    });
    fireEvent.change(screen.getByLabelText(/meditation duration/i), {
      target: { value: '8' },
    });
    fireEvent.change(screen.getByLabelText(/guidance mode/i), {
      target: { value: 'body_scan' },
    });
    fireEvent.change(screen.getByLabelText(/sound cue/i), {
      target: { value: 'none' },
    });
    fireEvent.change(screen.getByLabelText(/ritual cadence/i), {
      target: { value: 'morning_evening' },
    });
    fireEvent.change(screen.getByLabelText(/morning ritual time/i), {
      target: { value: '07:15' },
    });
    fireEvent.change(screen.getByLabelText(/evening ritual time/i), {
      target: { value: '20:45' },
    });
    fireEvent.change(screen.getByLabelText(/dedication/i), {
      target: { value: 'Dedicate the block to steady attention.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save ritual settings/i }));

    expect(JSON.parse(localStorage.getItem(RITUAL_COPY_STORAGE_KEY) ?? '{}')).toMatchObject({
      dedicationText: 'Dedicate the block to steady attention.',
      intentionText: 'Start with one patient breath.',
    });
    expect(
      JSON.parse(localStorage.getItem(RITUAL_MEDITATION_SETTINGS_STORAGE_KEY) ?? '{}'),
    ).toMatchObject({
      durationMinutes: 8,
      guidanceMode: 'body_scan',
      soundMode: 'none',
    });
    expect(
      JSON.parse(localStorage.getItem(RITUAL_SCHEDULE_SETTINGS_STORAGE_KEY) ?? '{}'),
    ).toMatchObject({
      cadenceMode: 'morning_evening',
      eveningTime: '20:45',
      manualEntryEnabled: true,
      morningTime: '07:15',
    });
    expect(screen.getByRole('status')).toHaveTextContent(/ritual settings saved/i);

    await waitFor(() => {
      expect(localStorage.getItem(APP_STATE_SNAPSHOT_STORAGE_KEY)).toContain(
        'Start with one patient breath.',
      );
      expect(localStorage.getItem(APP_STATE_SNAPSHOT_STORAGE_KEY)).toContain('20:45');
    });
  });

  it('restores a browser fallback snapshot before route content reads defaults', async () => {
    localStorage.setItem(
      APP_STATE_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({
        appVersion: '0.1.0',
        entries: {
          'attentionos.hierarchy.v1': JSON.stringify([
            {
              id: 'vision-restored',
              entityType: 'task',
              hierarchyLayer: 'vision',
              title: 'Restored Vision',
              status: 'active',
              properties: {},
              workflowStage: 'overview',
              createdAt: '2026-05-23T00:00:00.000Z',
              updatedAt: '2026-05-23T00:00:00.000Z',
            },
          ]),
        },
        exportedAt: '2026-05-23T00:00:00.000Z',
        schemaVersion: 1,
      }),
    );

    render(
      <MemoryRouter initialEntries={['/overview']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findAllByText(/restored vision/i)).not.toHaveLength(0);
  });
});
