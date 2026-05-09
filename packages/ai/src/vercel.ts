import {
  type EmbeddingModel,
  embed,
  embedMany,
  generateText,
  type LanguageModel,
  stepCountIs,
} from 'ai';
import type { TaskDecomposerInput, TaskDecomposerOutput } from './agent';
import { parseTaskDecomposerOutput } from './output';
import { buildTaskDecompositionPrompt, type RuntimePromptTemplate } from './prompts';
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

interface GenerateTextInput {
  readonly model: LanguageModel;
  readonly prompt: string;
  readonly stopWhen: ReturnType<typeof stepCountIs>;
  readonly system: string;
}

type GenerateTextLike = (input: GenerateTextInput) => Promise<{ readonly text: string }>;

interface VercelTaskDecomposerOptions {
  readonly generateText?: GenerateTextLike;
  readonly systemTemplate?: RuntimePromptTemplate;
}

export function createVercelTaskDecomposer(
  model: LanguageModel,
  options: VercelTaskDecomposerOptions = {},
): {
  decompose(input: TaskDecomposerInput): Promise<TaskDecomposerOutput>;
} {
  const generate: GenerateTextLike = options.generateText ?? ((input) => generateText(input));

  return {
    async decompose(input) {
      const prompt = buildTaskDecompositionPrompt(input, {
        systemTemplate: options.systemTemplate,
      });
      const result = await generate({
        model,
        stopWhen: stepCountIs(3),
        system: prompt.system,
        prompt: prompt.prompt,
      });

      return parseTaskDecomposerOutput(result.text);
    },
  };
}
