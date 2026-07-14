import { createAttentionOSReadContract } from '@attentionos/sdk';
import { describe, expect, it } from 'vitest';
import {
  ATTENTIONOS_MCP_SERVER_NAME,
  type AttentionOSMcpManifest,
  assertReadOnlyMcpManifest,
  createReadOnlyMcpManifest,
} from './index';

describe('AttentionOS MCP read-only manifest', () => {
  it('mirrors the SDK read contract as MCP resources without tools', () => {
    const contract = createAttentionOSReadContract('2026-05-24T03:30:00.000Z');
    const manifest = createReadOnlyMcpManifest(contract);

    expect(manifest.serverName).toBe(ATTENTIONOS_MCP_SERVER_NAME);
    expect(manifest.tools).toEqual([]);
    expect(manifest.resources.map((resource) => resource.uri)).toEqual(
      contract.resources.map((resource) => resource.uri),
    );
    expect(manifest.resources.every((resource) => resource.readOnly)).toBe(true);
  });

  it('rejects any accidental write-tool exposure', () => {
    const manifest = createReadOnlyMcpManifest();
    const unsafeManifest = {
      ...manifest,
      tools: [{ name: 'attentionos.write.entity' }],
    } as unknown as AttentionOSMcpManifest;

    expect(() => assertReadOnlyMcpManifest(unsafeManifest)).toThrow(/must not expose tools/i);
  });
});
