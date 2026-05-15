import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
  const tables = ['comunicados', 'reservas', 'encomendas', 'visitantes', 'ocorrencias', 'boletos'];
  
  for (const table of tables) {
    const { data, count } = await supabase.from(table).select('*', { count: 'exact' });
    console.log(`Table ${table}: ${count} rows`);
    if (data && data.length > 0) {
      console.log(`First row sample:`, data[0]);
    }
  }
}

check();
