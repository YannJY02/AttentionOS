import { describe, expect, it } from 'vitest';
import {
  buildTaskDecompositionPrompt,
  renderPromptTemplate,
  TASK_DECOMPOSITION_PROMPT_KEY,
} from './prompts';

const TASK_INPUT = {
  content: 'Raw phone number 555-0100 should not be used by the adapter.',
  context: [
    { id: 'ctx-1', score: 0.9, text: 'Related execution note', privacyLevel: 'L0' as const },
  ],
  model: {
    capabilities: ['tool-calling' as const],
    costTier: 'low' as const,
    id: 'local',
    model: 'local/task-decomposer',
    privacyScope: 'local' as const,
    provider: 'attentionos-local',
  },
  sanitizedPrompt: 'Redacted task details [REDACTED_PHONE]',
  taskId: 'task-1',
  title: 'Wire execution',
};

describe('prompt runtime', () => {
  it('renders database-backed prompt templates with explicit variables', () => {
    const rendered = renderPromptTemplate('Return JSON for {{ title }} using {{ context }}', {
      context: 'retrieved context',
      title: 'Wire execution',
    });

    expect(rendered).toBe('Return JSON for Wire execution using retrieved context');
  });

  it('fails closed when a prompt template references an unknown variable', () => {
    expect(() => renderPromptTemplate('Use {{ missing }}', { title: 'Wire execution' })).toThrow(
      /missing/i,
    );
  });

  it('builds task decomposition prompts from sanitized input and injectable templates', () => {
    const prompt = buildTaskDecompositionPrompt(TASK_INPUT, {
      systemTemplate: {
        key: TASK_DECOMPOSITION_PROMPT_KEY,
        template: 'Strict JSON for {{ title }} with {{ context }}.',
        variables: ['title', 'context'],
      },
    });

    expect(prompt.system).toBe('Strict JSON for Wire execution with Related execution note.');
    expect(prompt.prompt).toContain('Redacted task details [REDACTED_PHONE]');
    expect(prompt.prompt).not.toContain('555-0100');
  });
});
