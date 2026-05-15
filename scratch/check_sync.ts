import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
  console.log("--- TENANTS ---");
  const { data: tenants } = await supabase.from('tenants').select('*');
  console.log(tenants);

  console.log("\n--- CONDOMINIOS ---");
  const { data: condos } = await supabase.from('condominios').select('*');
  console.log(condos);

  console.log("\n--- MEMBERSHIPS ---");
  const { data: memberships } = await supabase.from('memberships').select('*, tenants(name)');
  console.log(memberships);
}

check();
