import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { EXECUTION_AUDIT_STORAGE_KEY } from '../storage/audit';
import { HIERARCHY_STORAGE_KEY } from '../storage/hierarchy';

function renderApp(initialEntry: string) {
  localStorage.removeItem(EXECUTION_AUDIT_STORAGE_KEY);
  localStorage.removeItem(HIERARCHY_STORAGE_KEY);

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>,
  );
}

async function startOverviewTask() {
  fireEvent.click(screen.getByRole('button', { name: /open personal context os/i }));
  fireEvent.click(screen.getByRole('button', { name: /open product development/i }));
  fireEvent.click(screen.getByRole('button', { name: /open phase 1 deterministic core/i }));
  fireEvent.click(screen.getByRole('button', { name: /open desktop workflow scaffold/i }));
  fireEvent.click(screen.getByRole('button', { name: /start execution for wire overview/i }));

  await screen.findByRole('heading', { name: /execution/i });
}

describe('ExecutionPage task workflow', () => {
  it('shows an empty execution state when no task is active', async () => {
    renderApp('/execution');

    expect(await screen.findByText(/no active task/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /back to overview/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
    });
  });

  it('drives the active task through planning, execution, review, and completion', async () => {
    renderApp('/overview');
    await startOverviewTask();

    expect(screen.getByText(/wire overview/i)).toBeInTheDocument();
    expect(screen.getByText(/state: planning/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start task/i }));
    expect(screen.getByText(/state: executing/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /add 5 minutes/i }));
    expect(screen.getByText(/actual: 5 min/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /submit for review/i }));
    expect(screen.getByText(/state: reviewing/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /complete task/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
    });

    const auditEntries = JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]');
    expect(auditEntries).toHaveLength(3);
    expect(auditEntries[2].details).toMatchObject({ event: 'COMPLETE', to: 'done' });
  });
});
