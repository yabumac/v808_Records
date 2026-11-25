import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Supabase client configured with PKCE OAuth flow for hardened authentication.
 * When env vars are absent the app falls back to local catalog preview mode.
 */
export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
