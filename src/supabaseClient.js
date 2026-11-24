/**
 * Supabase Client Configuration for TaskFlow
 *
 * Environment Variables README:
 * -----------------------------
 * TaskFlow reads the public Supabase URL and publishable anon key from environment
 * variables when available, and falls back to the configured project credentials.
 *
 * Supported variable names (for Vite, Netlify, Vercel, or Firebase Hosting):
 *   - VITE_SUPABASE_URL      or  SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY or  SUPABASE_ANON_KEY
 *
 * Security Note:
 *   Only use the public publishable/anon key in browser code.
 *   NEVER expose or embed a Supabase service_role / secret key in the client.
 */

import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://tmeblxdizojynhrainph.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_LbShToqOnoQCQ35_dZH-GA_-EeQQ6bv';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  FALLBACK_SUPABASE_URL;

const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
