import { beforeEach, describe, expect, it } from 'vitest';
import {
  completeOnboarding,
  isOnboardingComplete,
  ONBOARDING_STORAGE_KEY,
  readOnboardingState,
} from './onboarding';
import { PRIVACY_SETTINGS_STORAGE_KEY } from './privacySettings';

describe('onboarding storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to incomplete first-run state', () => {
    expect(readOnboardingState()).toMatchObject({
      completedAt: null,
      localDataAcknowledged: false,
      nonMedicalAcknowledged: false,
    });
    expect(isOnboardingComplete()).toBe(false);
  });

  it('completes onboarding and preserves the local-first privacy boundary', () => {
    const completed = completeOnboarding();

    expect(completed).toMatchObject({
      completedAt: expect.any(String),
      localDataAcknowledged: true,
      nonMedicalAcknowledged: true,
    });
    expect(readOnboardingState()).toMatchObject({
      localDataAcknowledged: true,
      nonMedicalAcknowledged: true,
    });
    expect(isOnboardingComplete()).toBe(true);
    expect(JSON.parse(localStorage.getItem(PRIVACY_SETTINGS_STORAGE_KEY) ?? '{}')).toMatchObject({
      externalAiCallsAllowed: false,
      localOnlyAcknowledged: true,
      telemetryOptIn: false,
    });
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toContain('completedAt');
  });

  it('falls back safely when stored onboarding state is malformed', () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, '{broken');

    expect(readOnboardingState()).toMatchObject({
      completedAt: null,
      localDataAcknowledged: false,
      nonMedicalAcknowledged: false,
    });
  });
});
