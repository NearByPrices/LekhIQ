/**
 * Supabase Client Configuration
 * Initializes Supabase client with DNS configuration
 */

import { createClient } from '@supabase/supabase-js';
import { getResolver, initializeDNS } from './dns-config';

// Ensure DNS is configured before creating Supabase client
initializeDNS();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Missing environment variables');
  console.warn('Please set:');
  console.warn('  NEXT_PUBLIC_SUPABASE_URL');
  console.warn('  NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Export resolver for use in server actions/API routes
export { getResolver } from './dns-config';

// Health check function
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (error) {
      console.error('[Supabase] Connection check failed:', error);
      return false;
    }

    console.log('[Supabase] ✓ Connection successful');
    return true;
  } catch (error) {
    console.error('[Supabase] Connection check error:', error);
    return false;
  }
}

export default supabase;
