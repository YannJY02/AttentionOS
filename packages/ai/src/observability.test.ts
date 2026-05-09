import { describe, expect, it } from 'vitest';
import { createBufferedObservabilitySink, recordGenerationObservation } from './observability';

describe('Phase 3 observability boundary', () => {
  it('normalizes latency and token usage before writing to a sink', async () => {
    const sink = createBufferedObservabilitySink();

    const event = await recordGenerationObservation(sink, {
      endedAt: '2026-05-09T12:00:01.250Z',
      metadata: { workflowStage: 'execution' },
      modelId: 'anthropic/claude-sonnet-4.6',
      name: 'workflow-optimization',
      qualityScore: 0.82,
      startedAt: '2026-05-09T12:00:00.000Z',
      usage: { inputTokens: 120, outputTokens: 45 },
    });

    expect(event).toMatchObject({
      latencyMs: 1250,
      modelId: 'anthropic/claude-sonnet-4.6',
      name: 'workflow-optimization',
      qualityScore: 0.82,
      tokenUsage: { input: 120, output: 45, total: 165 },
    });
    expect(sink.events).toEqual([event]);
  });
});
