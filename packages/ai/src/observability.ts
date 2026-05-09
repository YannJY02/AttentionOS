export interface AIUsageInput {
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly totalTokens?: number;
  readonly cacheReadInputTokens?: number;
}

export interface GenerationObservationInput {
  readonly endedAt: string;
  readonly metadata?: Record<string, unknown>;
  readonly modelId: string;
  readonly name: string;
  readonly provider?: string;
  readonly qualityScore?: number;
  readonly startedAt: string;
  readonly usage?: AIUsageInput;
}

export interface GenerationObservationEvent {
  readonly endedAt: string;
  readonly latencyMs: number;
  readonly metadata: Record<string, unknown>;
  readonly modelId: string;
  readonly name: string;
  readonly provider?: string;
  readonly qualityScore?: number;
  readonly startedAt: string;
  readonly tokenUsage: {
    readonly cacheReadInput?: number;
    readonly input: number;
    readonly output: number;
    readonly total: number;
  };
}

export interface ObservabilitySink {
  readonly flush?: () => Promise<void>;
  readonly record: (event: GenerationObservationEvent) => Promise<void>;
}

export interface BufferedObservabilitySink extends ObservabilitySink {
  readonly events: GenerationObservationEvent[];
}

function normalizeUsage(usage: AIUsageInput | undefined): GenerationObservationEvent['tokenUsage'] {
  const input = usage?.inputTokens ?? 0;
  const output = usage?.outputTokens ?? 0;
  const total = usage?.totalTokens ?? input + output + (usage?.cacheReadInputTokens ?? 0);

  return {
    cacheReadInput: usage?.cacheReadInputTokens,
    input,
    output,
    total,
  };
}

function latencyMs(startedAt: string, endedAt: string): number {
  return Math.max(0, Date.parse(endedAt) - Date.parse(startedAt));
}

export function createBufferedObservabilitySink(): BufferedObservabilitySink {
  const events: GenerationObservationEvent[] = [];
  return {
    events,
    async flush() {
      return;
    },
    async record(event) {
      events.push(event);
    },
  };
}

export function createNoopObservabilitySink(): ObservabilitySink {
  return {
    async flush() {
      return;
    },
    async record() {
      return;
    },
  };
}

export async function recordGenerationObservation(
  sink: ObservabilitySink,
  input: GenerationObservationInput,
): Promise<GenerationObservationEvent> {
  const event: GenerationObservationEvent = {
    endedAt: input.endedAt,
    latencyMs: latencyMs(input.startedAt, input.endedAt),
    metadata: input.metadata ?? {},
    modelId: input.modelId,
    name: input.name,
    provider: input.provider,
    qualityScore: input.qualityScore,
    startedAt: input.startedAt,
    tokenUsage: normalizeUsage(input.usage),
  };

  await sink.record(event);
  return event;
}
