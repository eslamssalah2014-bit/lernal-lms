// ============================================================================
// LERNAL LMS - FRONTEND CENTRALIZED SUPABASE CLIENT
// Configured with Vite environment variables & session persistence
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const url = (
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  ).trim();

  const anonKey = (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  return { url, anonKey };
};

const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getSupabaseConfig();

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Singleton Supabase Client for client-side Auth and database interactions
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'lernal_supabase_auth_token',
    },
  }
);

export default supabase;
