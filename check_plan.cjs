require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// use service role key if available, otherwise anon key
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: profile } = await supabase
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

  console.log('Profile via Service Role:', JSON.stringify(profile, null, 2));
}
check();
