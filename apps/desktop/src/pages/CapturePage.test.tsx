import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { CONTEXT_CAPTURE_STORAGE_KEY } from '../storage/contextCapture';

describe('CapturePage context bus', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('routes one capture into idea, task, project, and calendar channels', async () => {
    render(
      <MemoryRouter initialEntries={['/capture']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /capture/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/capture text/i), {
      target: { value: 'Convert this meeting note into a follow-up plan.' },
    });
    fireEvent.click(screen.getByLabelText(/task input/i));
    fireEvent.click(screen.getByLabelText(/project input/i));
    fireEvent.click(screen.getByLabelText(/calendar intent/i));
    fireEvent.change(screen.getByLabelText(/calendar intent time/i), {
      target: { value: '2026-05-24T10:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save capture/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/idea, task, project, calendar/i);
    expect(screen.getByText(/convert this meeting note/i)).toBeInTheDocument();
    expect(localStorage.getItem(CONTEXT_CAPTURE_STORAGE_KEY)).toContain('2026-05-24T10:30');
    expect(localStorage.getItem(CONTEXT_CAPTURE_STORAGE_KEY)).toContain('project');
  });
});
