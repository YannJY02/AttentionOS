import { describe, expect, it } from 'vitest';
import { createRetriever, InMemoryVectorStore } from './rag';

describe('RAG retrieval', () => {
  it('returns nearest context by cosine similarity', async () => {
    const store = new InMemoryVectorStore();
    await store.upsert([
      {
        id: 'task-1',
        text: 'Write the thesis method section',
        embedding: [1, 0],
        metadata: { entityType: 'task' },
        privacyLevel: 'L0',
      },
      {
        id: 'task-2',
        text: 'Clean the downloads folder',
        embedding: [0, 1],
        metadata: { entityType: 'task' },
        privacyLevel: 'L0',
      },
    ]);

    const retriever = createRetriever({
      embedder: { embed: async () => [0.9, 0.1], embedMany: async () => [] },
      store,
    });

    const results = await retriever.retrieve('writing task', { limit: 1 });
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('task-1');
  });

  it('omits never-process records from retrieval results', async () => {
    const store = new InMemoryVectorStore();
    await store.upsert([
      { id: 'safe', text: 'safe context', embedding: [1], privacyLevel: 'L0' },
      { id: 'blocked', text: 'secret context', embedding: [1], privacyLevel: 'L3' },
    ]);

    const results = await store.search([1], { limit: 5 });
    expect(results.map((result) => result.id)).toEqual(['safe']);
  });
});
