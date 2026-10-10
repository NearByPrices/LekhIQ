// Simple DNS test without Next.js or TypeScript compilation
const dns = require('dns').promises;

async function testDNS() {
  console.log('\n=== Simple DNS Configuration Test ===\n');

  // Test 1: Default DNS
  console.log('TEST 1: Checking default DNS resolver...');
  try {
    const addresses = await dns.resolve4('google.com');
    console.log('✓ Default DNS works! Google resolved to:', addresses[0]);
    console.log('  Status: System DNS resolver is WORKING\n');
  } catch (error) {
    console.log('✗ Default DNS FAILED:', error.code);
    console.log('  Will configure public DNS...\n');

    // Configure public DNS
    dns.setServers(['8.8.8.8', '1.1.1.1', '9.9.9.9']);
    console.log('✓ Configured public DNS servers\n');

    // Test public DNS
    console.log('TEST 2: Testing public DNS servers...');
    try {
      const addresses = await dns.resolve4('google.com');
      console.log('✓ Public DNS works! Google resolved to:', addresses[0]);
      console.log('  Status: Public DNS resolver is WORKING\n');

      // Test Supabase
      console.log('TEST 3: Testing Supabase domain...');
      const supabaseAddrs = await dns.resolve4('supabase.co');
      console.log('✓ Supabase accessible! Resolved to:', supabaseAddrs[0]);
      console.log('  Status: Supabase is REACHABLE\n');
    } catch (err) {
      console.log('✗ Public DNS FAILED:', err.message);
      process.exit(1);
    }
  }

  console.log('=================================');
  console.log('✓ DNS Configuration is WORKING!');
  console.log('=================================\n');
}

testDNS().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
