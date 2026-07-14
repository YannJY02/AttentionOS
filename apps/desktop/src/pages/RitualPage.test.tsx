import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import {
  REFLECTION_CORRUPT_STORAGE_KEY,
  REFLECTION_RECOVERY_STORAGE_KEY,
  REFLECTION_STORAGE_KEY,
} from '../adapters/storage/reflections';
import {
  RITUAL_COPY_STORAGE_KEY,
  RITUAL_MEDITATION_SETTINGS_STORAGE_KEY,
  RITUAL_SCHEDULE_SETTINGS_STORAGE_KEY,
} from '../adapters/storage/ritualCopy';

function renderRitualPage() {
  render(
    <MemoryRouter initialEntries={['/ritual']}>
      <App />
    </MemoryRouter>,
  );
}

async function completeMeditation() {
  fireEvent.click(screen.getByRole('button', { name: /start meditation/i }));
  fireEvent.click(screen.getByRole('button', { name: /complete meditation/i }));
  expect(await screen.findByRole('heading', { name: /^reflection$/i })).toBeInTheDocument();
}

async function saveReflection(text: string) {
  fireEvent.change(screen.getByLabelText(/reflection/i), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: /save reflection/i }));
  expect(await screen.findByRole('heading', { name: /dedication/i })).toBeInTheDocument();
}

describe('RitualPage workflow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders settling-oriented meditation controls without implementation copy', () => {
    renderRitualPage();

    const meditationHeading = screen.getByRole('heading', { name: /meditation/i });
    expect(meditationHeading).toBeInTheDocument();
    expect(screen.getByText(/settle your attention/i)).toBeInTheDocument();

    const ritualStep = meditationHeading.closest('section');
    expect(ritualStep).toBeTruthy();
    expect(
      within(ritualStep as HTMLElement).queryByText(/deterministic|state machine/i),
    ).not.toBeInTheDocument();
    expect(within(ritualStep as HTMLElement).queryByText(/^status:/i)).not.toBeInTheDocument();
    expect(screen.getByText(/breath: ready/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start meditation/i }));
    expect(screen.getByRole('button', { name: /pause meditation/i })).toBeInTheDocument();
    expect(screen.getByText(/breath: in rhythm/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /pause meditation/i }));
    expect(screen.getByRole('button', { name: /resume meditation/i })).toBeInTheDocument();
    expect(screen.getByText(/breath: paused/i)).toBeInTheDocument();
  });

  it('persists reflection text as a reflection entity before dedication', async () => {
    renderRitualPage();

    await completeMeditation();
    await saveReflection('Focus on the one task that matters today.');

    const stored = JSON.parse(localStorage.getItem(REFLECTION_STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      content: 'Focus on the one task that matters today.',
      entityType: 'reflection',
      status: 'completed',
      workflowStage: 'ritual',
    });
  });

  it('shows a useful empty reflection state before saving', async () => {
    renderRitualPage();

    await completeMeditation();

    expect(screen.getByText(/reflection is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save reflection/i })).toBeDisabled();
  });

  it('surfaces malformed reflection recovery before accepting a new note', async () => {
    localStorage.setItem(REFLECTION_STORAGE_KEY, '{broken');
    renderRitualPage();

    await completeMeditation();

    expect(
      screen.getByRole('heading', { name: /reflection storage was recovered/i }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(REFLECTION_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(REFLECTION_CORRUPT_STORAGE_KEY)).toContain('{broken');

    fireEvent.click(screen.getByRole('button', { name: /clear warning/i }));

    expect(localStorage.getItem(REFLECTION_RECOVERY_STORAGE_KEY)).toBeNull();
    expect(
      screen.queryByRole('heading', { name: /reflection storage was recovered/i }),
    ).not.toBeInTheDocument();
  });

  it('marks reflection text as later task and project input when requested', async () => {
    renderRitualPage();

    await completeMeditation();
    fireEvent.change(screen.getByLabelText(/reflection/i), {
      target: { value: 'Turn the vague launch worry into a concrete next action.' },
    });
    fireEvent.click(screen.getByLabelText(/use as task input/i));
    fireEvent.click(screen.getByLabelText(/use as project input/i));
    fireEvent.click(screen.getByRole('button', { name: /save reflection/i }));

    const stored = JSON.parse(localStorage.getItem(REFLECTION_STORAGE_KEY) ?? '[]');
    expect(stored[0]).toMatchObject({
      content: 'Turn the vague launch worry into a concrete next action.',
      properties: {
        ritualFollowUpTargets: ['task', 'project'],
      },
    });
  });

  it('marks dedication text as later task and project input when requested', async () => {
    localStorage.setItem(
      RITUAL_COPY_STORAGE_KEY,
      JSON.stringify({
        intentionText: 'Settle before choosing.',
        dedicationText: 'Carry this dedication into a concrete follow-up.',
      }),
    );
    renderRitualPage();

    await completeMeditation();
    await saveReflection('Reflect before dedication.');
    fireEvent.click(screen.getByLabelText(/use dedication as task input/i));
    fireEvent.click(screen.getByLabelText(/use dedication as project input/i));
    fireEvent.click(screen.getByRole('button', { name: /complete ritual/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
    });

    const stored = JSON.parse(localStorage.getItem(REFLECTION_STORAGE_KEY) ?? '[]');
    expect(stored).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: 'Carry this dedication into a concrete follow-up.',
          title: 'Ritual dedication',
          properties: expect.objectContaining({
            ritualFollowUpTargets: ['task', 'project'],
            ritualInputKind: 'dedication',
          }),
        }),
      ]),
    );
  });

  it('uses locally configured intention and dedication wording when present', async () => {
    localStorage.setItem(
      RITUAL_COPY_STORAGE_KEY,
      JSON.stringify({
        intentionText: 'Settle into patient product thinking.',
        dedicationText: 'Dedicate this block to careful attention.',
      }),
    );
    localStorage.setItem(
      RITUAL_MEDITATION_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        durationMinutes: 7,
        guidanceMode: 'body_scan',
        soundMode: 'none',
      }),
    );
    localStorage.setItem(
      RITUAL_SCHEDULE_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        cadenceMode: 'morning_evening',
        eveningTime: '20:45',
        manualEntryEnabled: true,
        morningTime: '07:15',
      }),
    );
    renderRitualPage();

    expect(screen.getByText('Settle into patient product thinking.')).toBeInTheDocument();
    expect(
      screen.getByText(/morning and evening ritual cadence .* 07:15 \/ 20:45/i),
    ).toBeInTheDocument();
    expect(screen.getByText('7:00')).toBeInTheDocument();
    expect(screen.getByText('Body scan')).toBeInTheDocument();
    expect(screen.getByText('No sound cue')).toBeInTheDocument();

    await completeMeditation();
    await saveReflection('Move deliberately.');

    expect(screen.getByText('Dedicate this block to careful attention.')).toBeInTheDocument();
  });

  it('advances to reflection when the configured meditation duration elapses', async () => {
    vi.useFakeTimers();
    localStorage.setItem(
      RITUAL_MEDITATION_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        durationMinutes: 1,
        guidanceMode: 'silent',
        soundMode: 'none',
      }),
    );
    renderRitualPage();

    fireEvent.click(screen.getByRole('button', { name: /start meditation/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(screen.getByRole('heading', { name: /reflection/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pause meditation/i })).not.toBeInTheDocument();
  });

  it('plays configured opening and closing bell cues', async () => {
    const oscillatorStart = vi.fn();
    const oscillatorStop = vi.fn();

    class FakeAudioContext {
      currentTime = 0;
      destination = {};

      createOscillator() {
        return {
          connect: vi.fn(),
          frequency: { value: 0 },
          start: oscillatorStart,
          stop: oscillatorStop,
        };
      }

      createGain() {
        return {
          connect: vi.fn(),
          gain: { value: 0 },
        };
      }
    }

    vi.stubGlobal('AudioContext', FakeAudioContext);
    renderRitualPage();

    fireEvent.click(screen.getByRole('button', { name: /start meditation/i }));
    expect(oscillatorStart).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /complete meditation/i }));

    expect(await screen.findByRole('heading', { name: /reflection/i })).toBeInTheDocument();
    expect(oscillatorStart).toHaveBeenCalledTimes(2);
    expect(oscillatorStop).toHaveBeenCalledTimes(2);
  });

  it('finishes dedication and transitions to overview', async () => {
    renderRitualPage();

    await completeMeditation();
    await saveReflection('Move deliberately.');
    fireEvent.click(screen.getByRole('button', { name: /complete ritual/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
    });
  });
});
