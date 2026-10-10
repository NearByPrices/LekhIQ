/**
 * DNS Configuration Utility
 * Handles DNS resolution issues on Windows and other environments
 * Provides explicit DNS configuration for Node.js applications
 */

import dns from 'dns';

// Public DNS servers (in order of preference)
const PUBLIC_DNS_SERVERS = [
  '8.8.8.8',      // Google DNS (Primary)
  '8.8.4.4',      // Google DNS (Secondary)
  '1.1.1.1',      // Cloudflare DNS
  '1.0.0.1',      // Cloudflare DNS (Secondary)
];

// Test DNS servers to verify connectivity
const TEST_HOSTS = [
  'supabase.co',
  'google.com',
  'cloudflare.com',
];

interface DNSStatus {
  isWorking: boolean;
  usingPublicDNS: boolean;
  configuredServers: string[];
  error?: string;
}

let dnsStatus: DNSStatus = {
  isWorking: true,
  usingPublicDNS: false,
  configuredServers: [],
};

/**
 * Initialize DNS configuration
 * Checks if default DNS is working, and configures public DNS if needed
 */
export async function initializeDNS(): Promise<DNSStatus> {
  // Check if default DNS is working
  const isDefaultDNSWorking = await testDefaultDNS();

  if (!isDefaultDNSWorking) {
    // Default DNS failed, switch to public DNS
    console.warn('[DNS] Default DNS resolver not responding. Switching to public DNS servers.');
    configurePublicDNS();
    dnsStatus.usingPublicDNS = true;
    dnsStatus.configuredServers = PUBLIC_DNS_SERVERS;

    // Verify public DNS works
    const isPublicDNSWorking = await testPublicDNS();
    dnsStatus.isWorking = isPublicDNSWorking;

    if (isPublicDNSWorking) {
      console.log('[DNS] ✓ Successfully configured public DNS servers');
    } else {
      dnsStatus.error = 'Both default and public DNS configuration failed';
      console.error('[DNS] ✗ Failed to configure DNS - check network connectivity');
    }
  } else {
    console.log('[DNS] ✓ Default DNS resolver is working');
    dnsStatus.isWorking = true;
    dnsStatus.usingPublicDNS = false;
  }

  return dnsStatus;
}

/**
 * Test if default DNS is working
 */
async function testDefaultDNS(): Promise<boolean> {
  try {
    const resolver = new dns.promises.Resolver();
    // Use default servers (no explicit setServers call)
    const addresses = await resolver.resolve4(TEST_HOSTS[0]);
    return addresses.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Test if public DNS is working
 */
async function testPublicDNS(): Promise<boolean> {
  try {
    const resolver = new dns.promises.Resolver();
    resolver.setServers(PUBLIC_DNS_SERVERS);
    const addresses = await resolver.resolve4(TEST_HOSTS[0]);
    return addresses.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Configure Node.js to use public DNS servers
 */
function configurePublicDNS(): void {
  // This sets the default DNS servers for all DNS operations in this Node process
  dns.setServers(PUBLIC_DNS_SERVERS);
}

/**
 * Get a DNS resolver with explicit configuration
 * Useful for specific operations that need guaranteed DNS resolution
 */
export function getResolver(): dns.promises.Resolver {
  const resolver = new dns.promises.Resolver();

  if (dnsStatus.usingPublicDNS) {
    resolver.setServers(PUBLIC_DNS_SERVERS);
  }

  return resolver;
}

/**
 * Resolve a hostname to IP addresses
 * Automatically uses public DNS if default resolver is not working
 */
export async function resolveHostname(hostname: string): Promise<string[]> {
  const resolver = getResolver();
  return resolver.resolve4(hostname);
}

/**
 * Get current DNS configuration status
 */
export function getDNSStatus(): DNSStatus {
  return { ...dnsStatus };
}

/**
 * Verify DNS connectivity to Supabase
 */
export async function testSupabaseDNS(supabaseUrl?: string): Promise<boolean> {
  try {
    const resolver = getResolver();
    const host = supabaseUrl
      ? new URL(supabaseUrl).hostname
      : 'supabase.co';
    const addresses = await resolver.resolve4(host);
    return addresses.length > 0;
  } catch (error) {
    console.error('[DNS] Failed to resolve Supabase:', error);
    return false;
  }
}

// Auto-initialize DNS on module load if running in Node.js environment
if (typeof window === 'undefined') {
  // This runs on the server side, not in the browser
  initializeDNS().catch(err => {
    console.error('[DNS] Failed to initialize DNS configuration:', err);
  });
}

export default {
  initializeDNS,
  getResolver,
  resolveHostname,
  getDNSStatus,
  testSupabaseDNS,
};
