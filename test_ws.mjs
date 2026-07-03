import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value) acc[key.trim()] = value.join('=').trim();
  return acc;
}, {});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWorkspace() {
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test_amrit_2026_07_03@gmail.com',
    password: 'password123',
  });

  if (signInError) {
    console.error('Sign In Error:', signInError);
    return;
  }
  
  console.log('Signed in as:', signInData.user.id);

  const { data, error } = await supabase
    .from('workspaces')
    .insert([{ name: 'Test Workspace', owner_id: signInData.user.id }])
    .select()
    .single();

  if (error) {
    console.error('Workspace Create Error:', error);
  } else {
    console.log('Workspace Created:', data);
  }
}

testWorkspace();
