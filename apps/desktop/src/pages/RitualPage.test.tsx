import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { REFLECTION_STORAGE_KEY } from '../storage/reflections';

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

  it('renders meditation controls driven by the meditation state machine', () => {
    renderRitualPage();

    expect(screen.getByRole('heading', { name: /meditation/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start meditation/i }));
    expect(screen.getByRole('button', { name: /pause meditation/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /pause meditation/i }));
    expect(screen.getByRole('button', { name: /resume meditation/i })).toBeInTheDocument();
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
