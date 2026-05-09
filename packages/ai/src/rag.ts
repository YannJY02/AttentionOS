import type { ContextSearchResult, PrivacyLevel } from '@attentionos/core';

export interface EmbeddingClient {
  embed(input: string): Promise<readonly number[]>;
  embedMany(inputs: readonly string[]): Promise<readonly (readonly number[])[]>;
}

export interface VectorStoreItem {
  readonly id: string;
  readonly entityId?: string;
  readonly text: string;
  readonly embedding: readonly number[];
  readonly metadata?: Record<string, unknown>;
  readonly modelId?: string;
  readonly modelVersion?: string;
  readonly privacyLevel: PrivacyLevel;
}

export interface VectorSearchOptions {
  readonly limit?: number;
  readonly maxPrivacyLevel?: PrivacyLevel;
}

export interface VectorStore {
  upsert(items: readonly VectorStoreItem[]): Promise<void>;
  search(
    embedding: readonly number[],
    options?: VectorSearchOptions,
  ): Promise<ContextSearchResult[]>;
}

export interface Retriever {
  retrieve(query: string, options?: VectorSearchOptions): Promise<ContextSearchResult[]>;
}

const PRIVACY_RANK: Record<PrivacyLevel, number> = { L0: 0, L1: 1, L2: 2, L3: 3 };

function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  const length = Math.min(a.length, b.length);
  if (length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < length; index += 1) {
    const left = a[index] ?? 0;
    const right = b[index] ?? 0;
    dot += left * right;
    normA += left * left;
    normB += right * right;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function canReturnPrivacy(level: PrivacyLevel, maxPrivacyLevel: PrivacyLevel): boolean {
  return level !== 'L3' && PRIVACY_RANK[level] <= PRIVACY_RANK[maxPrivacyLevel];
}

export class InMemoryVectorStore implements VectorStore {
  private readonly items = new Map<string, VectorStoreItem>();

  async upsert(items: readonly VectorStoreItem[]): Promise<void> {
    for (const item of items) {
      this.items.set(item.id, { ...item, embedding: [...item.embedding] });
    }
  }

  async search(
    embedding: readonly number[],
    options: VectorSearchOptions = {},
  ): Promise<ContextSearchResult[]> {
    const limit = options.limit ?? 5;
    const maxPrivacyLevel = options.maxPrivacyLevel ?? 'L2';

    return [...this.items.values()]
      .filter((item) => canReturnPrivacy(item.privacyLevel, maxPrivacyLevel))
      .map((item) => ({
        id: item.id,
        entityId: item.entityId,
        text: item.text,
        score: cosineSimilarity(embedding, item.embedding),
        metadata: item.metadata,
        modelId: item.modelId,
        modelVersion: item.modelVersion,
        privacyLevel: item.privacyLevel,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export function createRetriever(input: {
  readonly embedder: EmbeddingClient;
  readonly store: VectorStore;
}): Retriever {
  return {
    async retrieve(query, options) {
      const embedding = await input.embedder.embed(query);
      return input.store.search(embedding, options);
    },
  };
}
