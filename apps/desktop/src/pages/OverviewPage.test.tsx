import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { HIERARCHY_STORAGE_KEY } from '../storage/hierarchy';
import { LEARNING_OBSERVATIONS_STORAGE_KEY } from '../storage/learning';

function renderOverviewPage() {
  localStorage.removeItem(HIERARCHY_STORAGE_KEY);
  localStorage.removeItem(LEARNING_OBSERVATIONS_STORAGE_KEY);

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
    expect(screen.getByRole('region', { name: /overview scan context/i })).toHaveTextContent(
      /current layer: vision/i,
    );
    expect(screen.getByText(/judge long-horizon direction/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /vision timeline/i })).toBeInTheDocument();
    expect(screen.getByText(/timeline-first vision scan/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /learning snapshot/i })).toBeInTheDocument();
    expect(screen.getByText(/attention trend/i)).toBeInTheDocument();
    expect(screen.queryByText(/deterministic|workflow scaffold|wire overview/i)).toBeNull();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /create|edit|delete|decompose|approve/i }),
    ).toBeNull();

    const timeline = screen.getByRole('region', { name: /vision timeline/i });
    const learningSnapshot = screen.getByRole('region', { name: /learning snapshot/i });
    expect(
      timeline.compareDocumentPosition(learningSnapshot) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

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
    fireEvent.click(screen.getByRole('button', { name: /open coherent stage experience/i }));
    fireEvent.click(screen.getByRole('button', { name: /open overview scan redesign/i }));

    expect(screen.getByText(/current layer: task/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /start execution for clarify overview scan/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /execution/i })).toBeInTheDocument();
    });
  });
});
