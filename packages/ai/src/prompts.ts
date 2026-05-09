import type { PromptTemplate } from '@attentionos/core';
import type { TaskDecomposerInput } from './agent';

export const TASK_DECOMPOSITION_PROMPT_KEY = 'task.decomposition.system';

type RuntimePromptTemplate = Pick<PromptTemplate, 'key' | 'template' | 'variables'>;

interface BuiltTaskDecompositionPrompt {
  readonly prompt: string;
  readonly system: string;
}

interface BuildTaskDecompositionPromptOptions {
  readonly systemTemplate?: RuntimePromptTemplate;
}

const DEFAULT_TASK_DECOMPOSITION_SYSTEM_TEMPLATE: RuntimePromptTemplate = {
  key: TASK_DECOMPOSITION_PROMPT_KEY,
  template:
    'Return strict JSON with title, rationale, and steps. Each step has title, optional rationale, and optional estimatedMinutes.',
  variables: [],
};

export function renderPromptTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
    const value = variables[key];
    if (value === undefined) {
      throw new Error(`Prompt template variable "${key}" is missing`);
    }

    return value;
  });
}

function contextToText(input: TaskDecomposerInput): string {
  return input.context.map((item) => item.text).join('\n---\n');
}

export function buildTaskDecompositionPrompt(
  input: TaskDecomposerInput,
  options: BuildTaskDecompositionPromptOptions = {},
): BuiltTaskDecompositionPrompt {
  const context = contextToText(input);
  const variables = {
    content: input.sanitizedPrompt,
    context,
    title: input.title,
  };
  const systemTemplate = options.systemTemplate ?? DEFAULT_TASK_DECOMPOSITION_SYSTEM_TEMPLATE;

  for (const variableName of systemTemplate.variables) {
    if (!(variableName in variables)) {
      throw new Error(`Prompt template variable "${variableName}" is unsupported`);
    }
  }

  return {
    system: renderPromptTemplate(systemTemplate.template, variables),
    prompt: [
      `Task: ${input.title}`,
      input.sanitizedPrompt ? `Details: ${input.sanitizedPrompt}` : '',
      context ? `Context: ${context}` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
}
