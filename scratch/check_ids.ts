
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIds() {
  const tables = ['visitantes', 'reservas', 'encomendas', 'comunicados', 'ocorrencias'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('condominio_id').limit(1);
    if (error) console.error(`Error in ${table}:`, error.message);
    else if (data && data.length > 0) {
      console.log(`Table ${table} sample condominio_id: ${data[0].condominio_id}`);
    }
  }
}

checkIds();
