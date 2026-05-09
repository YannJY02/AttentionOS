import type { ContextSearchResult } from '@attentionos/core';
import { describe, expect, it } from 'vitest';
import { createStorageBackedRagRuntime } from './rag-runtime';

const SEARCH_RESULT: ContextSearchResult = {
  id: 'emb-1',
  entityId: '11111111-1111-4111-8111-111111111111',
  metadata: { source: 'test' },
  modelId: 'text-embedding-3-small',
  modelVersion: '2026-05-09',
  privacyLevel: 'L0',
  score: 0.91,
  text: 'Relevant execution note',
};

describe('storage-backed RAG runtime', () => {
  it('retrieves context through storage vector search', async () => {
    const calls: unknown[] = [];
    const rag = createStorageBackedRagRuntime({
      embedder: {
        embed: async () => [1, 0, 0],
        embedMany: async () => [[1, 0, 0]],
      },
      embeddings: {
        create: async () => {
          throw new Error('should not index during retrieve');
        },
        search: async (input) => {
          calls.push(input);
          return [SEARCH_RESULT];
        },
      },
      model: {
        dimensions: 3,
        id: 'text-embedding-3-small',
        version: '2026-05-09',
      },
    });

    const results = await rag.retrieve('execution note', { limit: 3, maxPrivacyLevel: 'L1' });

    expect(results).toEqual([SEARCH_RESULT]);
    expect(calls).toEqual([
      expect.objectContaining({
        embedding: [1, 0, 0],
        matchCount: 3,
        maxPrivacyLevel: 'L1',
        modelId: 'text-embedding-3-small',
      }),
    ]);
  });

  it('indexes text with model metadata and stable content hash', async () => {
    const createdInputs: unknown[] = [];
    const rag = createStorageBackedRagRuntime({
      embedder: {
        embed: async () => [0.1, 0.2, 0.3],
        embedMany: async () => [[0.1, 0.2, 0.3]],
      },
      embeddings: {
        create: async (input) => {
          createdInputs.push(input);
          return {
            id: 'emb-1',
            createdAt: '2026-05-09T00:00:00.000Z',
            updatedAt: '2026-05-09T00:00:00.000Z',
            ...input,
          };
        },
        search: async () => [],
      },
      model: {
        dimensions: 3,
        id: 'text-embedding-3-small',
        version: '2026-05-09',
      },
    });

    const result = await rag.indexText({
      entityId: '11111111-1111-4111-8111-111111111111',
      metadata: { source: 'task' },
      privacyLevel: 'L1',
      text: 'Index this context',
    });

    expect(result).toMatchObject({
      content: 'Index this context',
      modelDimensions: 3,
      modelId: 'text-embedding-3-small',
      modelVersion: '2026-05-09',
      privacyLevel: 'L1',
    });
    expect(createdInputs).toEqual([
      expect.objectContaining({
        contentHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        embedding: [0.1, 0.2, 0.3],
      }),
    ]);
  });
});
