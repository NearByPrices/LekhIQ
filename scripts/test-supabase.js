#!/usr/bin/env node

/**
 * Supabase Network Connectivity Diagnostic Test
 * Tests DNS resolution, connectivity, and network reachability to Supabase
 */

const dns = require('dns').promises;
const http = require('http');
const https = require('https');
const net = require('net');

// Supabase and other test hosts
const TEST_HOSTS = [
  { name: 'Supabase', host: 'xkihyjzdqgahkuqogqie.supabase.co', port: 443, protocol: 'https' },
  { name: 'Google DNS', host: 'google.com', port: 443, protocol: 'https' },
  { name: 'Cloudflare', host: 'cloudflare.com', port: 443, protocol: 'https' },
  { name: 'GitHub', host: 'github.com', port: 443, protocol: 'https' },
  { name: 'NPM Registry', host: 'registry.npmjs.org', port: 443, protocol: 'https' },
];

const DNS_SERVERS = [
  '8.8.8.8',      // Google
  '1.1.1.1',      // Cloudflare
  '9.9.9.9',      // Quad9
];

async function testDnsResolution(hostname) {
  try {
    const addresses = await dns.resolve4(hostname);
    return { success: true, addresses, hostname };
  } catch (error) {
    return { success: false, error: error.message, hostname };
  }
}

async function testDnsWithCustomServer(hostname, server) {
  try {
    const resolver = new dns.Resolver();
    resolver.setServers([server]);
    const addresses = await resolver.resolve4(hostname);
    return { success: true, addresses, server };
  } catch (error) {
    return { success: false, error: error.message, server };
  }
}

function testHttpsConnection(hostname, port) {
  return new Promise((resolve) => {
    const req = https.get(`https://${hostname}:${port}`, { timeout: 5000 }, (res) => {
      req.destroy();
      resolve({ success: true, statusCode: res.statusCode, hostname });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout', hostname });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message, hostname });
    });
  });
}

function testTcpConnection(hostname, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: hostname, port, timeout: 5000 });

    socket.on('connect', () => {
      socket.destroy();
      resolve({ success: true, hostname, port });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ success: false, error: 'Timeout', hostname, port });
    });

    socket.on('error', (error) => {
      resolve({ success: false, error: error.message, hostname, port });
    });
  });
}

async function runDiagnostics() {
  console.log('\n' + '='.repeat(70));
  console.log('SUPABASE NETWORK CONNECTIVITY DIAGNOSTIC TEST');
  console.log('='.repeat(70) + '\n');

  // Test 1: DNS Resolution with default resolver
  console.log('TEST 1: DNS Resolution (Default Resolver)');
  console.log('-'.repeat(70));
  for (const host of TEST_HOSTS) {
    const result = await testDnsResolution(host.host);
    if (result.success) {
      console.log(`✓ ${host.name.padEnd(20)} - ${host.host}`);
      console.log(`  Resolved to: ${result.addresses.join(', ')}`);
    } else {
      console.log(`✗ ${host.name.padEnd(20)} - ${host.host}`);
      console.log(`  Error: ${result.error}`);
    }
  }

  // Test 2: DNS with Custom Servers
  console.log('\n\nTEST 2: DNS Resolution (Custom DNS Servers)');
  console.log('-'.repeat(70));
  const supabaseHost = TEST_HOSTS[0].host;
  for (const server of DNS_SERVERS) {
    const result = await testDnsWithCustomServer(supabaseHost, server);
    if (result.success) {
      console.log(`✓ ${server.padEnd(15)} - Successfully resolved ${supabaseHost}`);
      console.log(`  IP: ${result.addresses.join(', ')}`);
    } else {
      console.log(`✗ ${server.padEnd(15)} - Failed to resolve ${supabaseHost}`);
      console.log(`  Error: ${result.error}`);
    }
  }

  // Test 3: TCP Connection
  console.log('\n\nTEST 3: TCP Connection (Port 443)');
  console.log('-'.repeat(70));
  for (const host of TEST_HOSTS.slice(0, 3)) {
    const result = await testTcpConnection(host.host, host.port);
    if (result.success) {
      console.log(`✓ ${host.name.padEnd(20)} - TCP connection established`);
    } else {
      console.log(`✗ ${host.name.padEnd(20)} - TCP connection failed`);
      console.log(`  Error: ${result.error}`);
    }
  }

  // Test 4: HTTPS Connection
  console.log('\n\nTEST 4: HTTPS Connection');
  console.log('-'.repeat(70));
  for (const host of TEST_HOSTS.slice(0, 3)) {
    const result = await testHttpsConnection(host.host, host.port);
    if (result.success) {
      console.log(`✓ ${host.name.padEnd(20)} - HTTPS connection successful`);
    } else {
      console.log(`✗ ${host.name.padEnd(20)} - HTTPS connection failed`);
      console.log(`  Error: ${result.error}`);
    }
  }

  // Test 5: Environment & Network Info
  console.log('\n\nTEST 5: Environment Information');
  console.log('-'.repeat(70));
  console.log(`Node.js Version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);

  const os = require('os');
  const interfaces = os.networkInterfaces();
  console.log('\nNetwork Interfaces:');
  for (const [name, addrs] of Object.entries(interfaces)) {
    const ipv4 = addrs.find(a => a.family === 'IPv4');
    if (ipv4) {
      console.log(`  ${name}: ${ipv4.address}`);
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('DIAGNOSTIC SUMMARY');
  console.log('='.repeat(70));
  console.log(`
If Supabase DNS resolution fails but other services work:
  → Network firewall/proxy is blocking DNS to Supabase
  → Solution: Configure firewall rules or use VPN

If ALL DNS resolution fails:
  → DNS is completely blocked in this environment
  → Solution: Configure custom DNS or use VPN

If DNS succeeds but TCP/HTTPS connection fails:
  → Port 443 is blocked or network routes are restricted
  → Solution: Check firewall, network policies, or routing

If all tests pass:
  → Network connectivity is fine - issue is elsewhere
  → Check Supabase credentials and API configuration
  `);
  console.log('='.repeat(70) + '\n');
}

runDiagnostics().catch(err => {
  console.error('Fatal error during diagnostics:', err);
  process.exit(1);
});
