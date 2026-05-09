import type { TaskDecomposerOutput } from './agent';

export interface OfflineEvalResult {
  readonly findings: readonly string[];
  readonly passed: boolean;
  readonly score: number;
}

interface TaskDecompositionEvalOptions {
  readonly maxEstimatedMinutes?: number;
  readonly minSteps?: number;
}

export function evaluateTaskDecomposition(
  output: TaskDecomposerOutput,
  options: TaskDecompositionEvalOptions = {},
): OfflineEvalResult {
  const maxEstimatedMinutes = options.maxEstimatedMinutes ?? 90;
  const minSteps = options.minSteps ?? 1;
  const findings: string[] = [];

  if (!output.title.trim()) {
    findings.push('Task decomposition title is required.');
  }

  if (!output.rationale.trim()) {
    findings.push('Task decomposition rationale is required.');
  }

  if (output.steps.length < minSteps) {
    findings.push(`Task decomposition must include at least ${minSteps} step.`);
  }

  for (const [index, step] of output.steps.entries()) {
    if (!step.title.trim()) {
      findings.push(`Step ${index + 1} title is required.`);
    }

    if (step.estimatedMinutes !== undefined && step.estimatedMinutes > maxEstimatedMinutes) {
      findings.push(`Step ${index + 1} estimated minutes exceeds ${maxEstimatedMinutes}.`);
    }
  }

  const score = findings.length === 0 ? 1 : Math.max(0, 1 - findings.length / 5);
  return {
    findings,
    passed: findings.length === 0,
    score,
  };
}
