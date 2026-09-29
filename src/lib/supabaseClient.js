import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Checks if Supabase credentials are configured in the environment.
 */
export const isSupabaseConfigured = () => {
  return Boolean(
    rawSupabaseUrl &&
    supabaseAnonKey &&
    rawSupabaseUrl.startsWith('https://') &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

/**
 * In local dev, routes Supabase API calls through Vite's local dev server proxy (/supabase-proxy)
 * which uses public DNS fallback (8.8.8.8/1.1.1.1) to completely bypass Indian ISP DNS blocks (NXDOMAIN on supabase.co).
 */
const getClientUrl = () => {
  if (!isSupabaseConfigured()) {
    return 'https://placeholder.supabase.co';
  }
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/supabase-proxy`;
  }
  return rawSupabaseUrl;
};

// Create client with fallback placeholder to prevent runtime crashes if env vars are missing
export const supabase = createClient(
  getClientUrl(),
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key'
);

