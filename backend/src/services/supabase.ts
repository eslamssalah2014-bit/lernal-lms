// ============================================================================
// LERNAL LMS - BACKEND CENTRALIZED SUPABASE CLIENT
// Connects Node/Express to Supabase PostgreSQL & Auth with Service Role & User Scopes
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL) {
  console.warn('⚠️  [Supabase] SUPABASE_URL is not set in environment variables.');
}

const activeKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

/**
 * Centralized Administrative Supabase Client (bypasses RLS where necessary on the backend)
 */
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder-url.supabase.co',
  activeKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Factory to create a user-scoped Supabase client that respects Row Level Security
 */
export function createUserScopedClient(bearerToken: string): SupabaseClient {
  return createClient(
    SUPABASE_URL || 'https://placeholder-url.supabase.co',
    SUPABASE_ANON_KEY || activeKey || 'placeholder-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    }
  );
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY));
};

export default supabaseAdmin;
