import { describe, expect, it } from 'vitest';
import { createPrivacyGateway } from './privacy';

describe('privacy gateway', () => {
  const gateway = createPrivacyGateway();

  it('classifies public text as L0', () => {
    expect(gateway.classifyText('Plan a focus block for writing.')).toBe('L0');
  });

  it('classifies directly identifying text as L1', () => {
    expect(gateway.classifyText('Email me at person@example.com tomorrow.')).toBe('L1');
  });

  it('keeps classification stable across repeated calls', () => {
    const text = 'Email me at person@example.com tomorrow.';

    expect(gateway.classifyText(text)).toBe('L1');
    expect(gateway.classifyText(text)).toBe('L1');
  });

  it('redacts L1 identifiers before external model calls', () => {
    const result = gateway.sanitizeForModel({
      text: 'Call +1 415 555 0101 or person@example.com.',
      target: 'external',
    });

    expect(result.privacyLevel).toBe('L1');
    expect(result.text).not.toContain('person@example.com');
    expect(result.text).toContain('[redacted:email]');
  });

  it('blocks local-only context from external model calls', () => {
    expect(() =>
      gateway.sanitizeForModel({
        text: 'Local keystroke trace',
        privacyLevel: 'L2',
        target: 'external',
      }),
    ).toThrow(/local-only/i);
  });

  it('blocks never-process context from all model calls', () => {
    expect(() =>
      gateway.sanitizeForModel({
        text: 'raw password vault export',
        privacyLevel: 'L3',
        target: 'local',
      }),
    ).toThrow(/never-process/i);
  });
});
