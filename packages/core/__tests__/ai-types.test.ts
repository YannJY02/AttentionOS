import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  AgentToolCall,
  AISuggestion,
  ContextSearchResult,
  EmbeddingRecord,
  PromptTemplate,
  TaskDecompositionSuggestion,
} from '../src/ai-types';
import { PRIVACY_LEVELS, SUGGESTION_STATUSES } from '../src/ai-types';

describe('Phase 2 AI type contracts', () => {
  it('defines ordered privacy levels', () => {
    expect(PRIVACY_LEVELS).toEqual(['L0', 'L1', 'L2', 'L3']);
  });

  it('defines HITL suggestion statuses', () => {
    expect(SUGGESTION_STATUSES).toEqual(['pending', 'approved', 'rejected', 'applied']);
  });

  it('exposes prompt template metadata', () => {
    expectTypeOf<PromptTemplate>().toHaveProperty('key');
    expectTypeOf<PromptTemplate>().toHaveProperty('template');
    expectTypeOf<PromptTemplate>().toHaveProperty('maxPrivacyLevel');
  });

  it('exposes embedding records with model migration metadata', () => {
    expectTypeOf<EmbeddingRecord>().toHaveProperty('modelId');
    expectTypeOf<EmbeddingRecord>().toHaveProperty('modelVersion');
    expectTypeOf<EmbeddingRecord>().toHaveProperty('privacyLevel');
  });

  it('exposes AI suggestions and task decomposition payloads', () => {
    expectTypeOf<AISuggestion>().toHaveProperty('status');
    expectTypeOf<TaskDecompositionSuggestion>().toHaveProperty('steps');
  });

  it('exposes context search and agent tool-call boundaries', () => {
    expectTypeOf<ContextSearchResult>().toHaveProperty('score');
    expectTypeOf<AgentToolCall>().toHaveProperty('approvalRequired');
  });
});
