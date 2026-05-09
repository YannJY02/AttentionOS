import type {
  AISuggestion,
  CreateAISuggestionInput,
  TaskDecompositionPayload,
} from '@attentionos/core';
import type {
  AISuggestionService,
  ApplyTaskDecompositionInput,
  ApplyTaskDecompositionResult,
  ListLatestTaskDecompositionInput,
} from './ai-suggestions';

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
  service: AISuggestionHttpService,
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

    return new Response('Not found', { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return jsonResponse({ error: message }, { status: 400 });
  }
}

export { normalizeService };
