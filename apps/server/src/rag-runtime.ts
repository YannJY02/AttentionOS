import { createHash } from 'node:crypto';
import type { EmbeddingClient, Retriever, VectorSearchOptions } from '@attentionos/ai';
import type {
  ContextSearchResult,
  CreateEmbeddingInput,
  EmbeddingRecord,
  PrivacyLevel,
} from '@attentionos/core';

interface EmbeddingRepositoryPort {
  readonly create: (input: CreateEmbeddingInput) => Promise<EmbeddingRecord>;
  readonly search: (input: {
    readonly embedding: readonly number[];
    readonly matchCount?: number;
    readonly matchThreshold?: number;
    readonly maxPrivacyLevel?: PrivacyLevel;
    readonly modelId?: string;
  }) => Promise<ContextSearchResult[]>;
}

interface RagModelConfig {
  readonly dimensions: number;
  readonly id: string;
  readonly version: string;
}

interface StorageBackedRagRuntimeInput {
  readonly embedder: EmbeddingClient;
  readonly embeddings: EmbeddingRepositoryPort;
  readonly model: RagModelConfig;
}

interface IndexTextInput {
  readonly entityId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly privacyLevel: PrivacyLevel;
  readonly text: string;
}

export interface StorageBackedRagRuntime extends Retriever {
  readonly indexText: (input: IndexTextInput) => Promise<EmbeddingRecord>;
}

function hashContent(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function createStorageBackedRagRuntime({
  embedder,
  embeddings,
  model,
}: StorageBackedRagRuntimeInput): StorageBackedRagRuntime {
  return {
    async indexText(input) {
      const embedding = await embedder.embed(input.text);

      return embeddings.create({
        content: input.text,
        contentHash: hashContent(`${model.id}:${model.version}:${input.text}`),
        embedding,
        entityId: input.entityId,
        metadata: input.metadata ?? {},
        modelDimensions: model.dimensions,
        modelId: model.id,
        modelVersion: model.version,
        privacyLevel: input.privacyLevel,
      });
    },

    async retrieve(query: string, options: VectorSearchOptions = {}) {
      const embedding = await embedder.embed(query);

      return embeddings.search({
        embedding,
        matchCount: options.limit,
        maxPrivacyLevel: options.maxPrivacyLevel,
        modelId: model.id,
      });
    },
  };
}
