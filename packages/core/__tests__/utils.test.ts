import { describe, expect, it } from 'vitest';
import { clamp, createId, normalizeLikertToUnit, slugify } from '../src/utils';

describe('clamp', () => {
  it('returns value within range', () => {
    expect(clamp(0.5)).toBe(0.5);
  });

  it('clamps to min', () => {
    expect(clamp(-0.1)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clamp(1.5)).toBe(1);
  });

  it('supports custom range', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(0, 1, 10)).toBe(1);
    expect(clamp(15, 1, 10)).toBe(10);
  });
});

describe('createId', () => {
  it('includes prefix', () => {
    const id = createId('test');
    expect(id).toMatch(/^test_/);
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createId('x')));
    expect(ids.size).toBe(100);
  });
});

describe('normalizeLikertToUnit', () => {
  it('maps midpoint to 0.5', () => {
    expect(normalizeLikertToUnit(3)).toBe(0.5);
  });

  it('maps min to 0', () => {
    expect(normalizeLikertToUnit(1)).toBe(0);
  });

  it('maps max to 1', () => {
    expect(normalizeLikertToUnit(5)).toBe(1);
  });
});

describe('slugify', () => {
  it('lowercases and replaces spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('foo@bar!')).toBe('foobar');
  });

  it('collapses multiple dashes', () => {
    expect(slugify('a  b   c')).toBe('a-b-c');
  });

  it('returns fallback for empty string', () => {
    expect(slugify('')).toBe('module');
  });
});
