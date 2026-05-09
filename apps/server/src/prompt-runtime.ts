import { TASK_DECOMPOSITION_PROMPT_KEY } from '@attentionos/ai';
import type { PromptTemplate } from '@attentionos/core';

type RuntimePromptTemplate = Pick<PromptTemplate, 'key' | 'template' | 'variables'>;

interface PromptRepositoryPort {
  readonly findActiveByKey: (key: string) => Promise<PromptTemplate | null>;
}

const SUPPORTED_TASK_DECOMPOSITION_VARIABLES = new Set(['content', 'context', 'title']);

function assertSupportedVariables(template: RuntimePromptTemplate): void {
  for (const variable of template.variables) {
    if (!SUPPORTED_TASK_DECOMPOSITION_VARIABLES.has(variable)) {
      throw new Error(`Prompt template variable "${variable}" is unsupported`);
    }
  }
}

export async function loadTaskDecompositionSystemTemplate(
  prompts: PromptRepositoryPort,
): Promise<RuntimePromptTemplate | null> {
  const template = await prompts.findActiveByKey(TASK_DECOMPOSITION_PROMPT_KEY);
  if (!template) {
    return null;
  }

  const runtimeTemplate = {
    key: template.key,
    template: template.template,
    variables: template.variables,
  };
  assertSupportedVariables(runtimeTemplate);
  return runtimeTemplate;
}
