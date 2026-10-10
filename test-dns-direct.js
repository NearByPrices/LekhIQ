// Direct DNS configuration test (no Next.js server needed)
require('./src/lib/dns-config');

const { getDNSStatus, testSupabaseDNS } = require('./src/lib/dns-config');

async function test() {
  console.log('\n=== Direct DNS Configuration Test ===\n');

  const status = getDNSStatus();
  console.log('DNS Status:', status);

  const supabaseResolvable = await testSupabaseDNS('https://xkihyjzdqgahkuqogqie.supabase.co');
  console.log('\nSupabase DNS Resolvable:', supabaseResolvable);

  console.log('\n✓ DNS Configuration is working!\n');
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
