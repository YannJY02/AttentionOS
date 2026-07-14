import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAllStorageRecoveryIssues,
  clearStorageRecoveryIssue,
  readStorageRecoveryIssues,
  recordMalformedStorageEntry,
  STORAGE_RECOVERY_ISSUES_STORAGE_KEY,
  STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY,
} from './storageRecovery';

describe('storage recovery ledger', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('preserves malformed payloads and exposes actionable recovery issues', () => {
    recordMalformedStorageEntry({
      error: new Error('Unexpected token'),
      fallback: 'Using safe defaults.',
      payload: '{broken',
      storageKey: 'attentionos.example.v1',
    });

    expect(readStorageRecoveryIssues()).toEqual([
      expect.objectContaining({
        fallback: 'Using safe defaults.',
        message: 'Unexpected token',
        originalBytes: 7,
        preserved: true,
        storageKey: 'attentionos.example.v1',
      }),
    ]);
    expect(JSON.parse(localStorage.getItem(STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY) ?? '{}')).toEqual(
      {
        'attentionos.example.v1': '{broken',
      },
    );
  });

  it('can clear one issue or all recovery warnings without touching app data', () => {
    localStorage.setItem('attentionos.example.v1', '{broken');
    recordMalformedStorageEntry({
      error: new Error('Unexpected token'),
      fallback: 'Using safe defaults.',
      payload: '{broken',
      storageKey: 'attentionos.example.v1',
    });
    recordMalformedStorageEntry({
      error: new Error('Not an array'),
      fallback: 'Using an empty queue.',
      payload: '{}',
      storageKey: 'attentionos.queue.v1',
    });

    clearStorageRecoveryIssue('attentionos.example.v1');

    expect(readStorageRecoveryIssues().map((issue) => issue.storageKey)).toEqual([
      'attentionos.queue.v1',
    ]);
    expect(localStorage.getItem('attentionos.example.v1')).toBe('{broken');

    clearAllStorageRecoveryIssues();

    expect(readStorageRecoveryIssues()).toEqual([]);
    expect(localStorage.getItem(STORAGE_RECOVERY_ISSUES_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY)).toBeNull();
  });
});
