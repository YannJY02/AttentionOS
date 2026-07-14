export function createId(prefix: string): string {
  const randomPart =
    globalThis.crypto && 'randomUUID' in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

  return `${prefix}_${randomPart.replace(/-/g, '').slice(0, 12)}`;
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeLikertToUnit(value: number, min = 1, max = 5): number {
  if (max <= min) {
    return 0;
  }

  return clamp((value - min) / (max - min));
}

export function slugify(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 64) || 'module'
  );
}
