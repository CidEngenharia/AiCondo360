
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('--- Condominios data ---');
  const { data: condos } = await supabase.from('condominios').select('*');
  console.log(condos);

  console.log('\n--- Tenants data ---');
  const { data: tenants } = await supabase.from('tenants').select('*');
  console.log(tenants);
  
  // Try to see if there are any other tables related
  const { data: tables } = await supabase.rpc('get_tables'); // If this RPC exists
  console.log('\n--- Tables (if RPC exists) ---', tables);
}

checkSchema();
