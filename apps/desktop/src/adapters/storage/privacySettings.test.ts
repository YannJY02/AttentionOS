import { beforeEach, describe, expect, it } from 'vitest';
import {
  PRIVACY_SETTINGS_STORAGE_KEY,
  readPrivacySettings,
  savePrivacySettings,
} from './privacySettings';
import {
  readStorageRecoveryIssues,
  STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY,
} from './storageRecovery';

describe('privacy settings storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to local-only, no external AI calls, and no telemetry opt-in', () => {
    expect(readPrivacySettings()).toMatchObject({
      externalAiCallsAllowed: false,
      localOnlyAcknowledged: false,
      telemetryOptIn: false,
      updatedAt: null,
    });
  });

  it('persists explicit privacy and AI boundary preferences', () => {
    const saved = savePrivacySettings({
      externalAiCallsAllowed: true,
      localOnlyAcknowledged: true,
      telemetryOptIn: false,
    });

    expect(saved.updatedAt).toEqual(expect.any(String));
    expect(readPrivacySettings()).toMatchObject({
      externalAiCallsAllowed: true,
      localOnlyAcknowledged: true,
      telemetryOptIn: false,
    });
    expect(localStorage.getItem(PRIVACY_SETTINGS_STORAGE_KEY)).toContain('externalAiCallsAllowed');
  });

  it('falls back safely when stored privacy settings are malformed', () => {
    localStorage.setItem(PRIVACY_SETTINGS_STORAGE_KEY, '{broken');

    expect(readPrivacySettings()).toMatchObject({
      externalAiCallsAllowed: false,
      localOnlyAcknowledged: false,
      telemetryOptIn: false,
      updatedAt: null,
    });
    expect(readStorageRecoveryIssues()).toEqual([
      expect.objectContaining({
        fallback: 'Using default privacy settings with external AI and telemetry off.',
        preserved: true,
        storageKey: PRIVACY_SETTINGS_STORAGE_KEY,
      }),
    ]);
    expect(JSON.parse(localStorage.getItem(STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY) ?? '{}')).toEqual(
      {
        [PRIVACY_SETTINGS_STORAGE_KEY]: '{broken',
      },
    );
  });
});
