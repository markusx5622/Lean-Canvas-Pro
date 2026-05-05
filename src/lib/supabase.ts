import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True only when both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present.
 * Use this flag to gate auth and cloud-sync features.
 */
export const isSupabaseConfigured: boolean = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    '[Lean Canvas Pro] Missing Supabase environment variables. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. ' +
      'Authentication and cloud sync features will be unavailable.'
  );
}

/**
 * Supabase client — null when env vars are missing so callers can detect the
 * unconfigured state without triggering false requests or secondary errors.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
