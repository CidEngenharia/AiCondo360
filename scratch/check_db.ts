import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const { data: condos, error: err1 } = await supabase.from('condominios').select('*').limit(1);
  console.log('Condominios sample:', condos);
  console.log('Condominios error:', err1);

  const { data: tenants, error: err2 } = await supabase.from('tenants').select('*').limit(1);
  console.log('Tenants sample:', tenants);
  console.log('Tenants error:', err2);
}

checkTables();
