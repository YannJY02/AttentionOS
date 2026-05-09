import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { handleAISuggestionRequest, normalizeAttentionOSService } from './http';
import { createSupabaseAISuggestionService, createSupabaseLearningRuntime } from './repositories';

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString('utf8');
}

async function toFetchRequest(request: IncomingMessage): Promise<Request> {
  const host = request.headers.host ?? '127.0.0.1:4317';
  const url = new URL(request.url ?? '/', `http://${host}`);
  const body =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await readBody(request);

  return new Request(url, {
    body,
    headers: request.headers as HeadersInit,
    method: request.method,
  });
}

async function writeFetchResponse(response: Response, reply: ServerResponse): Promise<void> {
  reply.statusCode = response.status;
  response.headers.forEach((value, key) => {
    reply.setHeader(key, value);
  });
  reply.end(await response.text());
}

export function createAttentionOSServer() {
  const service = normalizeAttentionOSService(
    createSupabaseAISuggestionService(),
    createSupabaseLearningRuntime(),
  );

  return createServer(async (request, reply) => {
    const fetchRequest = await toFetchRequest(request);
    const response = await handleAISuggestionRequest(fetchRequest, service);
    await writeFetchResponse(response, reply);
  });
}

export function startAttentionOSServer(port = Number(process.env.ATTENTIONOS_SERVER_PORT ?? 4317)) {
  const server = createAttentionOSServer();
  server.listen(port, '127.0.0.1');
  return server;
}

if (process.env.ATTENTIONOS_SERVER_AUTOSTART === '1') {
  startAttentionOSServer();
}
