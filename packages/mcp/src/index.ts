import {
  ATTENTIONOS_READ_PROTOCOL_VERSION,
  type AttentionOSReadContract,
  assertReadOnlyContract,
  createAttentionOSReadContract,
} from '@attentionos/sdk';

export const ATTENTIONOS_MCP_SERVER_NAME = 'attentionos-local-readonly' as const;

export interface AttentionOSMcpResource {
  readonly description: string;
  readonly mimeType: 'application/json';
  readonly name: string;
  readonly readOnly: true;
  readonly uri: string;
}

export interface AttentionOSMcpManifest {
  readonly protocolVersion: typeof ATTENTIONOS_READ_PROTOCOL_VERSION;
  readonly resources: readonly AttentionOSMcpResource[];
  readonly serverName: typeof ATTENTIONOS_MCP_SERVER_NAME;
  readonly tools: readonly [];
}

function resourceName(uri: string): string {
  return uri.replace('attentionos://read/', 'attentionos.');
}

export function createReadOnlyMcpManifest(
  contract: AttentionOSReadContract = createAttentionOSReadContract(),
): AttentionOSMcpManifest {
  assertReadOnlyContract(contract);

  return {
    protocolVersion: contract.protocolVersion,
    resources: contract.resources.map((resource) => ({
      description: resource.description,
      mimeType: resource.mimeType,
      name: resourceName(resource.uri),
      readOnly: true,
      uri: resource.uri,
    })),
    serverName: ATTENTIONOS_MCP_SERVER_NAME,
    tools: [],
  };
}

export function assertReadOnlyMcpManifest(manifest: AttentionOSMcpManifest): void {
  if (manifest.protocolVersion !== ATTENTIONOS_READ_PROTOCOL_VERSION) {
    throw new Error(`Unsupported AttentionOS MCP protocol version: ${manifest.protocolVersion}`);
  }

  if (manifest.tools.length > 0) {
    throw new Error('The release-candidate MCP manifest must not expose tools.');
  }

  for (const resource of manifest.resources) {
    if (!resource.readOnly) {
      throw new Error(`MCP resource ${resource.uri} is not read-only.`);
    }
  }
}
