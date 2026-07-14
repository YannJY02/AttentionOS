import { beforeEach, describe, expect, it } from 'vitest';
import {
  CONTEXT_CAPTURE_STORAGE_KEY,
  listContextCapturePlanningInputs,
  readContextCaptures,
  saveContextCapture,
} from './contextCapture';

describe('context capture storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves one input into multiple local context channels', () => {
    const capture = saveContextCapture({
      calendarIntentAt: '2026-05-24T10:30',
      channels: ['idea', 'task', 'project', 'calendar'],
      content: 'Turn the meeting note into a grant follow-up.',
    });

    expect(capture).toMatchObject({
      calendarIntentAt: '2026-05-24T10:30',
      channels: ['idea', 'task', 'project', 'calendar'],
      content: 'Turn the meeting note into a grant follow-up.',
    });
    expect(readContextCaptures()).toEqual([expect.objectContaining({ id: capture.id })]);
    expect(listContextCapturePlanningInputs()).toEqual([
      expect.objectContaining({ channels: expect.arrayContaining(['task', 'project']) }),
    ]);
    expect(localStorage.getItem(CONTEXT_CAPTURE_STORAGE_KEY)).toContain('grant follow-up');
  });

  it('requires text and at least one channel', () => {
    expect(() => saveContextCapture({ channels: ['idea'], content: ' ' })).toThrow(/text/i);
    expect(() => saveContextCapture({ channels: [], content: 'Remember this.' })).toThrow(
      /channel/i,
    );
  });
});
