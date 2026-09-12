import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These are read from Vite env vars (see .env.example). Only the anon/public
// key ever belongs in frontend code - never the service role key, which the
// backend keeps to itself (see backend/.env.example).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// The rest of the app is designed to keep working in "demo mode" (mock data,
// localStorage) when Supabase hasn't been configured yet - exactly how this
// prototype already behaves today. Components that need live data should
// check isSupabaseConfigured (or catch errors from these calls) and fall
// back to their existing mock data path.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : null;

export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
