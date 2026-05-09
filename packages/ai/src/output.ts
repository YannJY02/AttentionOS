import { z } from 'zod';
import type { TaskDecomposerOutput } from './agent';

const TaskDecompositionStepSchema = z.object({
  dependsOn: z.array(z.string().min(1)).optional(),
  estimatedMinutes: z.number().positive().optional(),
  rationale: z.string().optional(),
  title: z.string().min(1),
});

const TaskDecomposerOutputSchema = z.object({
  rationale: z.string(),
  steps: z.array(TaskDecompositionStepSchema).min(1),
  title: z.string().min(1),
});

export function parseTaskDecomposerOutput(raw: string): TaskDecomposerOutput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Task decomposer output must be valid JSON');
  }

  const result = TaskDecomposerOutputSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid task decomposition output: ${result.error.message}`);
  }

  return result.data;
}
