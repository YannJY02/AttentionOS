import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { HIERARCHY_STORAGE_KEY } from '../storage/hierarchy';

function renderOverviewPage() {
  localStorage.removeItem(HIERARCHY_STORAGE_KEY);

  render(
    <MemoryRouter initialEntries={['/overview']}>
      <App />
    </MemoryRouter>,
  );
}

describe('OverviewPage hierarchy workflow', () => {
  it('renders a read-only five-layer overview with breadcrumb navigation', () => {
    renderOverviewPage();

    expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByText(/current layer: vision/i)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create|edit|delete|decompose/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /open personal context os/i }));
    expect(screen.getByText(/current layer: area/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /hierarchy breadcrumb/i })).toHaveTextContent(
      /personal context os/i,
    );

    fireEvent.click(screen.getByRole('button', { name: /back to parent/i }));
    expect(screen.getByText(/current layer: vision/i)).toBeInTheDocument();
  });

  it('shows start execution only at the task layer and routes through daily flow', async () => {
    renderOverviewPage();

    expect(screen.queryByRole('button', { name: /start execution/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /open personal context os/i }));
    fireEvent.click(screen.getByRole('button', { name: /open product development/i }));
    fireEvent.click(screen.getByRole('button', { name: /open phase 1 deterministic core/i }));
    fireEvent.click(screen.getByRole('button', { name: /open desktop workflow scaffold/i }));

    expect(screen.getByText(/current layer: task/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /start execution for wire overview/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /execution/i })).toBeInTheDocument();
    });
  });
});
