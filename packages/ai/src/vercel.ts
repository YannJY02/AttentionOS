import {
  type EmbeddingModel,
  embed,
  embedMany,
  generateText,
  type LanguageModel,
  stepCountIs,
} from 'ai';
import type { TaskDecomposerInput, TaskDecomposerOutput } from './agent';
import { buildTaskDecompositionPrompt } from './prompts';
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
      const prompt = buildTaskDecompositionPrompt(input);
      const result = await generateText({
        model,
        stopWhen: stepCountIs(3),
        system: prompt.system,
        prompt: prompt.prompt,
      });

      return JSON.parse(result.text) as TaskDecomposerOutput;
    },
  };
}
