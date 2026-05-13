import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('AttentionOS desktop shell', () => {
  it('redirects the root route to the ritual stage', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /ritual/i })).toBeInTheDocument();
  });

  it('renders the three canonical workflow stage navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/overview']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('link', { name: /^ritual$/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /^overview$/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /^execution$/i }).length).toBeGreaterThanOrEqual(1);
    for (const executionLink of screen.getAllByRole('link', { name: /^execution$/i })) {
      expect(executionLink).toHaveAttribute('href', '/execution/plan');
    }
  });

  it('renders the overview route as a read-only workflow stage', () => {
    render(
      <MemoryRouter initialEntries={['/overview']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByText(/A read-only view/i)).toBeInTheDocument();
  });
});
