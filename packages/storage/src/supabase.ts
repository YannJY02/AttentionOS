import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        'Copy .env.example to .env.local and fill in your Supabase credentials.',
    );
  }
  return value;
}

let _client: SupabaseClient | null = null;

/**
 * Get the singleton Supabase client.
 * Uses service_role key to bypass RLS for Phase 1 server-side operations.
 *
 * Call this lazily (not at module load time) to allow tests to mock the client.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    const url = requireEnv('SUPABASE_URL');
    const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
    _client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

/** Reset the singleton (for testing) */
export function _resetSupabaseClient(): void {
  _client = null;
}
