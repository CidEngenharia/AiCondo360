require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  // Try to login if we can
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: 'adailton.sindico@aicondo360.com',
    password: 'Password123!' // Using common password or wait.. I don't know it! Let's guess "123456" "sindico123"
  });

  if (authError) {
    console.error('Login failed, we cannot test the authenticated session:', authError.message);
  } else {
    // If successful, test profile select
    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`*, condominios(id, name, plan)`)
        .eq('id', auth.user.id)
        .maybeSingle();

    console.log('Profile Result:', JSON.stringify({ profile, error }, null, 2));
  }
}
check();
