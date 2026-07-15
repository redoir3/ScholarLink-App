/**
 * Creates / resets the LocalLink admin account for quick access.
 * Usage: node scripts/seed-admin.js
 *
 * Default credentials (change after first login in production):
 *   Email:    admin@locallink.app
 *   Password: LocalLinkAdmin2026!
 *
 * Override with env:
 *   ADMIN_EMAIL / ADMIN_PASSWORD
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const email = process.env.ADMIN_EMAIL || 'admin@locallink.app';
const password = process.env.ADMIN_PASSWORD || 'LocalLinkAdmin2026!';

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase env vars');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Find existing
  const { data: listed } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const existing = listed?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId;
  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { role: 'admin', full_name: 'LocalLink Admin' },
      app_metadata: { role: 'admin' },
    });
    if (error) {
      console.error('Update failed:', error.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log('Updated existing admin user:', email);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin', full_name: 'LocalLink Admin' },
      app_metadata: { role: 'admin' },
    });
    if (error) {
      console.error('Create failed:', error.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log('Created admin user:', email);
  }

  // Upsert profile (table may not exist yet)
  const { error: pErr } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: 'LocalLink Admin',
    role: 'admin',
  });
  if (pErr) {
    console.warn('Profile upsert skipped (run sql/002_auth_and_saved.sql first):', pErr.message);
  } else {
    console.log('Profile role set to admin');
  }

  console.log('\n========================================');
  console.log(' ADMIN CREDENTIALS (keep private)');
  console.log(' Email:   ', email);
  console.log(' Password:', password);
  console.log(' Login:   /login  →  Admin tab');
  console.log('========================================\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
