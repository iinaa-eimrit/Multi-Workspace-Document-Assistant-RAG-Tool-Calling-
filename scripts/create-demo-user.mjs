/**
 * Creates the demo user account for evaluators.
 * Run once: node scripts/create-demo-user.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const email = 'demo@docassist.app';
  const password = 'demodemo123';

  // Create user (auto-confirmed via admin API)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Demo User' }
  });

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log('✓ Demo user already exists');
    } else {
      console.error('Error creating demo user:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✓ Demo user created:', data.user.id);
  }
}

main();
