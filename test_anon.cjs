require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
    .from('condominios')
    .select('id, name, plan');
  if (error) {
    console.error('Anon select error:', error);
  } else {
    console.log('Anon select success. Found', data.length, 'records.');
    const cv = data.find(c => c.name.includes('Verde Vale'));
    if (cv) console.log('Verde Vale:', cv);
  }
}
check();
