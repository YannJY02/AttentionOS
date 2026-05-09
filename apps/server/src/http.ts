import type {
  AISuggestion,
  CreateAISuggestionInput,
  LearningWindow,
  TaskDecompositionPayload,
  WorkflowOptimizationPayload,
} from '@attentionos/core';
import type {
  AISuggestionService,
  ApplyTaskDecompositionInput,
  ApplyTaskDecompositionResult,
  ListLatestTaskDecompositionInput,
} from './ai-suggestions';
import type { LearningRuntime } from './learning-runtime';

type JsonValue = unknown;

export interface AISuggestionHttpService {
  readonly applyTaskDecompositionSuggestion: (
    input: ApplyTaskDecompositionInput,
  ) => Promise<ApplyTaskDecompositionResult | JsonValue>;
  readonly createTaskDecompositionSuggestion: (
    input: CreateAISuggestionInput<TaskDecompositionPayload>,
  ) => Promise<AISuggestion<TaskDecompositionPayload> | JsonValue>;
  readonly listLatestTaskDecompositionSuggestion: (
    input: ListLatestTaskDecompositionInput,
  ) => Promise<AISuggestion<TaskDecompositionPayload> | null | JsonValue>;
}

export interface AttentionOSHttpService extends AISuggestionHttpService {
  readonly analyzeLearningWindow?: (input: LearningWindow) => Promise<{
    readonly createdSuggestions: readonly AISuggestion<WorkflowOptimizationPayload>[];
    readonly report: unknown;
  }>;
}

function jsonResponse(body: JsonValue, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  });
}

async function readJsonBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Request body must be valid JSON');
  }
}

function normalizeService(service: AISuggestionService): AISuggestionHttpService {
  return service;
}

export async function handleAISuggestionRequest(
  request: Request,
  service: AttentionOSHttpService,
): Promise<Response> {
  const url = new URL(request.url);

  try {
    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse({ status: 'ok' });
    }

    if (request.method === 'POST' && url.pathname === '/v1/ai/task-decomposition') {
      const input = (await readJsonBody(
        request,
      )) as CreateAISuggestionInput<TaskDecompositionPayload>;
      return jsonResponse(await service.createTaskDecompositionSuggestion(input), { status: 201 });
    }

    if (request.method === 'GET' && url.pathname === '/v1/ai/task-decomposition/latest') {
      const targetId = url.searchParams.get('targetId');
      if (!targetId) {
        return jsonResponse({ error: 'targetId is required' }, { status: 400 });
      }

      return jsonResponse(await service.listLatestTaskDecompositionSuggestion({ targetId }));
    }

    if (request.method === 'POST' && url.pathname === '/v1/ai/task-decomposition/apply') {
      const input = (await readJsonBody(request)) as ApplyTaskDecompositionInput;
      return jsonResponse(await service.applyTaskDecompositionSuggestion(input));
    }

    if (request.method === 'POST' && url.pathname === '/v1/learning/analyze') {
      if (!service.analyzeLearningWindow) {
        return jsonResponse({ error: 'learning runtime is not configured' }, { status: 503 });
      }

      const input = (await readJsonBody(request)) as LearningWindow;
      if (!input.startedAt || !input.endedAt) {
        return jsonResponse({ error: 'startedAt and endedAt are required' }, { status: 400 });
      }

      return jsonResponse(await service.analyzeLearningWindow(input), { status: 201 });
    }

    return new Response('Not found', { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return jsonResponse({ error: message }, { status: 400 });
  }
}

export function normalizeAttentionOSService(
  aiService: AISuggestionService,
  learningRuntime?: LearningRuntime,
): AttentionOSHttpService {
  return {
    ...normalizeService(aiService),
    analyzeLearningWindow: learningRuntime?.analyzeWindow,
  };
}

export { normalizeService };
