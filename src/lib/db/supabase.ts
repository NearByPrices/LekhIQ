import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { config } from '@/lib/config/env';

export function createSupabaseBrowserClient() {
  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('Supabase URL and anon key are required');
  }

  return createBrowserClient(config.supabase.url, config.supabase.anonKey);
}

export async function createSupabaseServerClient() {
  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('Supabase URL and anon key are required');
  }

  const cookieStore = await cookies();

  return createServerClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Handle in middleware or layout
        }
      },
    },
  });
}

export function createSupabaseServiceClient() {
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    throw new Error('Supabase URL and service role key are required');
  }

  return createServerClient(config.supabase.url, config.supabase.serviceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
