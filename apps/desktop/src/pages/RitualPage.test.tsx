import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { REFLECTION_STORAGE_KEY } from '../storage/reflections';
import { RITUAL_COPY_STORAGE_KEY } from '../storage/ritualCopy';

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
  expect(await screen.findByRole('heading', { name: /reflection/i })).toBeInTheDocument();
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

  it('uses locally configured intention and dedication wording when present', async () => {
    localStorage.setItem(
      RITUAL_COPY_STORAGE_KEY,
      JSON.stringify({
        intentionText: 'Settle into patient product thinking.',
        dedicationText: 'Dedicate this block to careful attention.',
      }),
    );
    renderRitualPage();

    expect(screen.getByText('Settle into patient product thinking.')).toBeInTheDocument();

    await completeMeditation();
    await saveReflection('Move deliberately.');

    expect(screen.getByText('Dedicate this block to careful attention.')).toBeInTheDocument();
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
