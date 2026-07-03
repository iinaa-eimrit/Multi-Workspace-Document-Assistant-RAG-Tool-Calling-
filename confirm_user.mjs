import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value) acc[key.trim()] = value.join('=').trim();
  return acc;
}, {});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function confirmUser() {
  const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
  if (fetchError) {
    console.error('Error fetching users:', fetchError);
    return;
  }
  
  const targetUser = users.users.find(u => u.email === 'test_amrit_2026_07_03@gmail.com');
  if (!targetUser) {
    console.error('User not found');
    return;
  }

  const { data, error } = await supabase.auth.admin.updateUserById(targetUser.id, {
    email_confirm: true,
  });

  if (error) {
    console.error('Error confirming user:', error);
  } else {
    console.log('Successfully confirmed user:', targetUser.email);
  }
}

confirmUser();
