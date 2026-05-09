import type { AgentToolName } from '@attentionos/core';
import { type ToolSet, tool } from 'ai';
import { z } from 'zod';

export const taskDecomposeInputSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().optional(),
  constraints: z.array(z.string().min(1)).default([]),
});

export const contextSearchInputSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(20).default(5),
  maxPrivacyLevel: z.enum(['L0', 'L1', 'L2']).default('L1'),
});

export const suggestionApproveInputSchema = z.object({
  suggestionId: z.string().min(1),
  reviewer: z.string().min(1),
});

const schemas = {
  'task.decompose': taskDecomposeInputSchema,
  'context.search': contextSearchInputSchema,
  'suggestion.approve': suggestionApproveInputSchema,
} as const;

export type TaskDecomposeInput = z.infer<typeof taskDecomposeInputSchema>;
export type ContextSearchInput = z.infer<typeof contextSearchInputSchema>;
export type SuggestionApproveInput = z.infer<typeof suggestionApproveInputSchema>;

export function parseAgentToolInput(toolName: 'task.decompose', input: unknown): TaskDecomposeInput;
export function parseAgentToolInput(toolName: 'context.search', input: unknown): ContextSearchInput;
export function parseAgentToolInput(
  toolName: 'suggestion.approve',
  input: unknown,
): SuggestionApproveInput;
export function parseAgentToolInput(toolName: string, input: unknown): unknown;
export function parseAgentToolInput(toolName: string, input: unknown) {
  const schema = schemas[toolName as AgentToolName];
  if (!schema) throw new Error(`Unknown agent tool: ${toolName}`);
  return schema.parse(input);
}

export function createAgentToolSet(handlers: {
  readonly decomposeTask: (input: TaskDecomposeInput) => Promise<unknown>;
  readonly searchContext: (input: ContextSearchInput) => Promise<unknown>;
  readonly approveSuggestion: (input: SuggestionApproveInput) => Promise<unknown>;
}): ToolSet {
  return {
    taskDecompose: tool({
      description: 'Break an approved task into smaller suggested execution steps.',
      inputSchema: taskDecomposeInputSchema,
      execute: handlers.decomposeTask,
    }),
    contextSearch: tool({
      description: 'Search AttentionOS context while respecting privacy levels.',
      inputSchema: contextSearchInputSchema,
      execute: handlers.searchContext,
    }),
    suggestionApprove: tool({
      description: 'Approve a pending human-in-the-loop AI suggestion.',
      inputSchema: suggestionApproveInputSchema,
      execute: handlers.approveSuggestion,
    }),
  };
}
