require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, condominios(*)')
    .eq('email', 'adailton.sindico@aicondo360.com')
    .single();
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Syndic Data:', JSON.stringify(data, null, 2));
  }
}
check();
