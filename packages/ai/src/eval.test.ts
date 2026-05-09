import { describe, expect, it } from 'vitest';
import { evaluateTaskDecomposition } from './eval';

describe('offline AI eval gate', () => {
  it('passes useful task decomposition output', () => {
    const result = evaluateTaskDecomposition({
      rationale: 'Split the task into reviewable work.',
      steps: [
        { estimatedMinutes: 10, title: 'Clarify outcome' },
        { estimatedMinutes: 20, title: 'Draft checklist' },
      ],
      title: 'Break down task',
    });

    expect(result).toMatchObject({
      passed: true,
      score: 1,
    });
    expect(result.findings).toEqual([]);
  });

  it('fails incomplete or low-signal decompositions with actionable findings', () => {
    const result = evaluateTaskDecomposition({
      rationale: '',
      steps: [{ estimatedMinutes: 180, title: '' }],
      title: '',
    });

    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(1);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/title/i),
        expect.stringMatching(/rationale/i),
        expect.stringMatching(/step/i),
        expect.stringMatching(/minutes/i),
      ]),
    );
  });
});
