import { describe, expect, it } from 'vitest';
import { parseAgentToolInput } from './tools';

describe('agent tool schemas', () => {
  it('validates task.decompose input', () => {
    const parsed = parseAgentToolInput('task.decompose', {
      taskId: 'task-1',
      title: 'Write thesis',
      constraints: ['25 minutes'],
    });

    expect(parsed.title).toBe('Write thesis');
  });

  it('rejects empty context.search queries', () => {
    expect(() => parseAgentToolInput('context.search', { query: '' })).toThrow();
  });

  it('rejects unknown tools', () => {
    expect(() => parseAgentToolInput('unknown.tool', {})).toThrow(/Unknown agent tool/i);
  });
});
