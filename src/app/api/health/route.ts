/**
 * Health Check API Route
 * Verifies DNS configuration and Supabase connectivity
 */

import { NextResponse } from 'next/server';
import { initializeDNS, getDNSStatus, testSupabaseDNS } from '@/lib/dns-config';
import { checkSupabaseConnection } from '@/lib/supabase';

export async function GET() {
  try {
    // Initialize DNS (will check and configure if needed)
    const dnsInit = await initializeDNS();
    const dnsStatus = getDNSStatus();

    // Test DNS to Supabase
    const supabaseDNS = await testSupabaseDNS(
      process.env.NEXT_PUBLIC_SUPABASE_URL
    );

    // Test Supabase connection (if credentials are set)
    let supabaseConnection = false;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      supabaseConnection = await checkSupabaseConnection();
    }

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      dns: {
        working: dnsStatus.isWorking,
        usingPublicDNS: dnsStatus.usingPublicDNS,
        configuredServers: dnsStatus.configuredServers,
        error: dnsStatus.error,
      },
      supabase: {
        dnsResolvable: supabaseDNS,
        connected:
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? supabaseConnection
            : 'not_configured',
      },
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
