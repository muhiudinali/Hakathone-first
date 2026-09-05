import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('wm_supabase_url');
    const customKey = localStorage.getItem('wm_supabase_key');
    if (customUrl && customKey) {
      return { url: customUrl.trim(), key: customKey.trim() };
    }
  }

  return { url: envUrl.trim(), key: envKey.trim() };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http') && !url.includes('your-project-ref'));
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key || !url.startsWith('http') || url.includes('your-project-ref')) {
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client', err);
    return null;
  }
}

export function saveSupabaseCredentials(url: string, key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wm_supabase_url', url.trim());
    localStorage.setItem('wm_supabase_key', key.trim());
    cachedClient = null;
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('wm_supabase_url');
    localStorage.removeItem('wm_supabase_key');
    cachedClient = null;
  }
}
