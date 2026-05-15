
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const tables = ['visitantes', 'comunicados', 'reservas', 'encomendas', 'boletos', 'ocorrencias'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('condominio_id, tenant_id').limit(1);
    if (error) {
      console.error(`Error fetching ${table}:`, error.message);
    } else {
      console.log(`${table} sample:`, JSON.stringify(data, null, 2));
    }
  }

  const { data: condos, error: cError } = await supabase.from('condominios').select('*').limit(5);
  if (cError) {
    console.error('Error fetching condominios:', cError.message);
  } else {
    console.log('Condominios sample:', JSON.stringify(condos, null, 2));
  }

  const { data: tenants, error: tError } = await supabase.from('tenants').select('*').limit(5);
  if (tError) {
    console.error('Error fetching tenants:', tError);
  } else {
    console.log('Tenants sample:', JSON.stringify(tenants, null, 2));
  }
}

checkData();
