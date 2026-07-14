import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { ONBOARDING_STORAGE_KEY } from './storage/onboarding';
import { APP_STATE_SNAPSHOT_STORAGE_KEY } from './storage/persistence';

describe('AttentionOS desktop shell', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects the first-run root route to onboarding', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', {
        name: /set up attentionos around the workflow it protects/i,
      }),
    ).toBeInTheDocument();
  });

  it('redirects the root route to Ritual after onboarding is complete', async () => {
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({
        completedAt: '2026-05-23T16:00:00.000Z',
        localDataAcknowledged: true,
        nonMedicalAcknowledged: true,
      }),
    );

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
    expect(screen.queryByText(/deterministic core/i)).not.toBeInTheDocument();
    expect(screen.getByText(/keep attention human-led/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /data & settings/i })).toHaveAttribute(
      'href',
      '/settings',
    );
  });

  it('surfaces corrupt local workspace recovery in the shell', async () => {
    localStorage.setItem(APP_STATE_SNAPSHOT_STORAGE_KEY, 'not valid json');

    render(
      <MemoryRouter initialEntries={['/overview']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(/local data recovery/i);
    expect(screen.getByRole('link', { name: /review recovery/i })).toHaveAttribute(
      'href',
      '/settings',
    );
  });

  it('renders the overview route as a read-only workflow stage', () => {
    render(
      <MemoryRouter initialEntries={['/overview']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByText(/read-only scan for the current hierarchy layer/i)).toBeInTheDocument();
  });

  it.each([
    '/planning',
    '/focus',
  ])('does not expose legacy %s as an active route', async (route) => {
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /ritual/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^planning$/i })).toBeNull();
    expect(screen.queryByRole('heading', { name: /^focus$/i })).toBeNull();
  });
});
