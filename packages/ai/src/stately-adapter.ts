export const STATELY_AGENT_INTEGRATION_STATUS = {
  packageName: '@statelyai/agent',
  status: 'experimental-adapter-boundary',
  rationale:
    'Keep Stately Agent behind a local boundary until its AI SDK peer dependencies align with AI SDK 6.',
} as const;

export interface StatelyAgentEventSchemaDescriptor {
  readonly name: string;
  readonly events: readonly string[];
}

export function createStatelyAgentDescriptor(
  descriptor: StatelyAgentEventSchemaDescriptor,
): StatelyAgentEventSchemaDescriptor {
  return { ...descriptor, events: [...descriptor.events] };
}
