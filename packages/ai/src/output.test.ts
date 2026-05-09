import { describe, expect, it } from 'vitest';
import { parseTaskDecomposerOutput } from './output';

describe('structured AI output validation', () => {
  it('parses valid task decomposition JSON', () => {
    const output = parseTaskDecomposerOutput(
      JSON.stringify({
        rationale: 'Split into reviewable steps',
        steps: [{ estimatedMinutes: 10, title: 'Clarify outcome' }],
        title: 'Break down task',
      }),
    );

    expect(output.steps[0]).toMatchObject({ title: 'Clarify outcome' });
  });

  it('rejects malformed or incomplete decomposition JSON', () => {
    expect(() => parseTaskDecomposerOutput('{not-json')).toThrow(/valid JSON/i);
    expect(() => parseTaskDecomposerOutput(JSON.stringify({ title: 'Missing steps' }))).toThrow(
      /task decomposition/i,
    );
  });
});
