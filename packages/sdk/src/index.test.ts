import { describe, expect, it } from 'vitest';
import {
  ATTENTIONOS_READ_PROTOCOL_VERSION,
  type AttentionOSReadContract,
  assertReadOnlyContract,
  createAttentionOSReadContract,
  createAttentionOSReadSnapshot,
} from './index';

describe('AttentionOS read protocol contract', () => {
  it('exposes only local, user-approved read capabilities', () => {
    const contract = createAttentionOSReadContract('2026-05-24T03:30:00.000Z');

    expect(contract.protocolVersion).toBe(ATTENTIONOS_READ_PROTOCOL_VERSION);
    expect(contract.generatedAt).toBe('2026-05-24T03:30:00.000Z');
    expect(contract.capabilities.length).toBeGreaterThan(0);
    expect(contract.capabilities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'attentionos.read.workflow',
          mode: 'read',
          requiresUserApproval: true,
          scope: 'local-app-state',
        }),
        expect.objectContaining({
          id: 'attentionos.read.entities',
          mode: 'read',
          requiresUserApproval: true,
          scope: 'local-app-state',
        }),
      ]),
    );
    expect(contract.capabilities.every((capability) => capability.mode === 'read')).toBe(true);
    expect(
      contract.capabilities.every((capability) => capability.scope === 'local-app-state'),
    ).toBe(true);
  });

  it('keeps resources read-only and stable for SDK and MCP adapters', () => {
    const contract = createAttentionOSReadContract('2026-05-24T03:30:00.000Z');

    expect(contract.resources.map((resource) => resource.uri)).toEqual([
      'attentionos://read/workflow-stage',
      'attentionos://read/hierarchy',
      'attentionos://read/entities',
      'attentionos://read/execution-state',
      'attentionos://read/ai-suggestions',
      'attentionos://read/attention-observations',
      'attentionos://read/audit-log',
    ]);
    expect(contract.resources.every((resource) => resource.readOnly)).toBe(true);
  });

  it('creates a read snapshot without adding write or external behavior', () => {
    const snapshot = createAttentionOSReadSnapshot({
      exportedAt: '2026-05-24T03:30:00.000Z',
      focusCandidateId: 'task-1',
      workflowStage: 'execution',
    });

    expect(snapshot).toMatchObject({
      exportedAt: '2026-05-24T03:30:00.000Z',
      focusCandidateId: 'task-1',
      protocolVersion: ATTENTIONOS_READ_PROTOCOL_VERSION,
      workflowStage: 'execution',
    });
    expect(snapshot.entities).toEqual([]);
    expect(snapshot.aiSuggestions).toEqual([]);
    expect(Object.keys(snapshot)).not.toContain('tools');
  });

  it('rejects non-read or non-local capability drift', () => {
    const contract = createAttentionOSReadContract('2026-05-24T03:30:00.000Z');
    const unsafeContract: AttentionOSReadContract = {
      ...contract,
      capabilities: [
        {
          ...contract.capabilities[0],
          mode: 'write',
        },
      ],
    } as unknown as AttentionOSReadContract;

    expect(() => assertReadOnlyContract(unsafeContract)).toThrow(/read-only/i);
  });
});
