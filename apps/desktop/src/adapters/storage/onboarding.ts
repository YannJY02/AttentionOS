import { queuePersistAppState } from './persistence';
import { savePrivacySettings } from './privacySettings';
import { recordMalformedStorageEntry } from './storageRecovery';

export const ONBOARDING_STORAGE_KEY = 'attentionos.onboarding.v1';

export interface OnboardingState {
  readonly completedAt: string | null;
  readonly localDataAcknowledged: boolean;
  readonly nonMedicalAcknowledged: boolean;
}

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  completedAt: null,
  localDataAcknowledged: false,
  nonMedicalAcknowledged: false,
};

function isOnboardingState(value: unknown): value is Partial<OnboardingState> {
  return typeof value === 'object' && value !== null;
}

export function readOnboardingState(): OnboardingState {
  const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_ONBOARDING_STATE;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isOnboardingState(parsed)) {
      recordMalformedStorageEntry({
        error: new Error('Onboarding state is not an object.'),
        fallback: 'Treating onboarding as incomplete so consent can be re-established.',
        payload: raw,
        storageKey: ONBOARDING_STORAGE_KEY,
      });
      return DEFAULT_ONBOARDING_STATE;
    }

    return {
      completedAt: typeof parsed.completedAt === 'string' ? parsed.completedAt : null,
      localDataAcknowledged:
        typeof parsed.localDataAcknowledged === 'boolean'
          ? parsed.localDataAcknowledged
          : DEFAULT_ONBOARDING_STATE.localDataAcknowledged,
      nonMedicalAcknowledged:
        typeof parsed.nonMedicalAcknowledged === 'boolean'
          ? parsed.nonMedicalAcknowledged
          : DEFAULT_ONBOARDING_STATE.nonMedicalAcknowledged,
    };
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Treating onboarding as incomplete so consent can be re-established.',
      payload: raw,
      storageKey: ONBOARDING_STORAGE_KEY,
    });
    return DEFAULT_ONBOARDING_STATE;
  }
}

export function isOnboardingComplete(): boolean {
  return Boolean(readOnboardingState().completedAt);
}

export function completeOnboarding(): OnboardingState {
  const nextState: OnboardingState = {
    completedAt: new Date().toISOString(),
    localDataAcknowledged: true,
    nonMedicalAcknowledged: true,
  };

  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(nextState));
  savePrivacySettings({
    externalAiCallsAllowed: false,
    localOnlyAcknowledged: true,
    telemetryOptIn: false,
  });
  queuePersistAppState();

  return nextState;
}
