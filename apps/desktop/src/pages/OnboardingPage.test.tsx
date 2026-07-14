import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { ONBOARDING_STORAGE_KEY } from '../storage/onboarding';
import { APP_STATE_SNAPSHOT_STORAGE_KEY } from '../storage/persistence';
import { PRIVACY_SETTINGS_STORAGE_KEY } from '../storage/privacySettings';

describe('OnboardingPage first-run flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('requires local-first and non-medical acknowledgements before entering Ritual', async () => {
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <App />
      </MemoryRouter>,
    );

    const beginButton = await screen.findByRole('button', { name: /begin with ritual/i });
    expect(beginButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/workspace starts local to this mac/i));
    expect(beginButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/not medical advice or clinical diagnosis/i));
    expect(beginButton).toBeEnabled();
    fireEvent.click(beginButton);

    expect(await screen.findByRole('heading', { name: /ritual/i })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(ONBOARDING_STORAGE_KEY) ?? '{}')).toMatchObject({
      completedAt: expect.any(String),
      localDataAcknowledged: true,
      nonMedicalAcknowledged: true,
    });
    expect(JSON.parse(localStorage.getItem(PRIVACY_SETTINGS_STORAGE_KEY) ?? '{}')).toMatchObject({
      externalAiCallsAllowed: false,
      localOnlyAcknowledged: true,
      telemetryOptIn: false,
    });

    await waitFor(() => {
      expect(localStorage.getItem(APP_STATE_SNAPSHOT_STORAGE_KEY)).toContain(
        'attentionos.onboarding.v1',
      );
    });
  });
});
