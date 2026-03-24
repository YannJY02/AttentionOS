import type { SupabaseClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

/** Chainable query builder mock — mirrors Supabase's fluent API */
function makeQueryBuilder(resolvedValue: unknown) {
  // Use a Proxy so every method returns `this` — supports arbitrary chaining.
  // When awaited, JavaScript calls `.then()` which delegates to the underlying promise.
  const promise = Promise.resolve(resolvedValue);
  const handler: ProxyHandler<object> = {
    get(_, prop) {
      if (prop === 'then') return promise.then.bind(promise);
      if (prop === 'catch') return promise.catch.bind(promise);
      if (prop === 'finally') return promise.finally.bind(promise);
      return vi.fn(() => proxy);
    },
  };
  const proxy = new Proxy({}, handler);
  return proxy;
}

export type MockSupabaseClient = {
  from: ReturnType<typeof vi.fn>;
};

/**
 * Create a mock Supabase client.
 *
 * @param data  Rows returned by select/insert/update queries.
 * @param error Supabase error object (null = success).
 */
export function createMockSupabaseClient(
  data: unknown = null,
  error: unknown = null,
): MockSupabaseClient {
  const builder = makeQueryBuilder({ data, error });
  const from = vi.fn(() => builder);
  return { from } as MockSupabaseClient;
}

export function asSupabaseClient(mock: MockSupabaseClient): SupabaseClient {
  return mock as unknown as SupabaseClient;
}
