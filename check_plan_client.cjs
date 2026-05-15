require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  // Login as syndic
  const { data: auth, error } = await supabase.auth.signInWithPassword({
    email: 'adailton.sindico@aicondo360.com',
    password: 'password123'
  });

  if (error) {
    console.log('Login failed', error);
    return;
  }

  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      role,
      condominio_id,
      condominios (
        id,
        name,
        plan
      )
    `)
    .eq('email', 'adailton.sindico@aicondo360.com')
    .single();

  console.log('Profile via Auth:', JSON.stringify(profile, null, 2), profErr);
}
check();
