import {
  type EmbeddingModel,
  embed,
  embedMany,
  generateText,
  type LanguageModel,
  stepCountIs,
} from 'ai';
import type { TaskDecomposerInput, TaskDecomposerOutput } from './agent';
import type { EmbeddingClient } from './rag';

export function createVercelEmbeddingClient(model: EmbeddingModel): EmbeddingClient {
  return {
    async embed(input) {
      const result = await embed({ model, value: input });
      return result.embedding;
    },

    async embedMany(inputs) {
      const result = await embedMany({ model, values: [...inputs] });
      return result.embeddings;
    },
  };
}

export function createVercelTaskDecomposer(model: LanguageModel): {
  decompose(input: TaskDecomposerInput): Promise<TaskDecomposerOutput>;
} {
  return {
    async decompose(input) {
      const result = await generateText({
        model,
        stopWhen: stepCountIs(3),
        system:
          'Return strict JSON with title, rationale, and steps. Each step has title, optional rationale, and optional estimatedMinutes.',
        prompt: [
          `Task: ${input.title}`,
          input.content ? `Details: ${input.content}` : '',
          `Context: ${input.context.map((item) => item.text).join('\n---\n')}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
      });

      return JSON.parse(result.text) as TaskDecomposerOutput;
    },
  };
}
