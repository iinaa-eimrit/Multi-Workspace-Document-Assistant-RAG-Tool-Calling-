import { createBrowserClient } from '@supabase/ssr';
import { env } from '../env';

/**
 * Creates a Supabase client for use in browser/client components.
 */
export function createClient() {
  return createBrowserClient(
    env.supabase.url,
    env.supabase.anonKey
  );
}
