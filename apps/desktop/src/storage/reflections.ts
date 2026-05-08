import type { V2Entity } from '@attentionos/core';

export const REFLECTION_STORAGE_KEY = 'attentionos.reflections.v1';

function createReflectionId(): string {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `reflection-${Date.now().toString(36)}`;
}

export function readReflections(): V2Entity[] {
  const raw = localStorage.getItem(REFLECTION_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReflection(text: string): V2Entity {
  const content = text.trim();

  if (!content) {
    throw new Error('Reflection text is required');
  }

  const now = new Date().toISOString();
  const reflection: V2Entity = {
    id: createReflectionId(),
    entityType: 'reflection',
    title: 'Ritual reflection',
    content,
    status: 'completed',
    properties: {
      source: 'ritual',
    },
    workflowStage: 'ritual',
    createdAt: now,
    updatedAt: now,
    completedAt: now,
  };

  localStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify([...readReflections(), reflection]));
  return reflection;
}
