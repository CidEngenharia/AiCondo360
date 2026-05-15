
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkColumns() {
  // We can't directly list columns with anon key easily unless we query a row and check keys
  // but if the table is empty, we can't do that.
  // We can try to insert a dummy row and see what errors we get about missing columns.
  
  console.log("Checking condominios...");
  const { data: cData, error: cError } = await supabase.from('condominios').select('*').limit(1);
  if (cError) console.error("Condominios error:", cError.message);
  else console.log("Condominios columns:", cData[0] ? Object.keys(cData[0]) : "Table empty or no access");

  console.log("Checking tenants...");
  const { data: tData, error: tError } = await supabase.from('tenants').select('*').limit(1);
  if (tError) console.error("Tenants error:", tError.message);
  else console.log("Tenants columns:", tData[0] ? Object.keys(tData[0]) : "Table empty or no access");
}

checkColumns();
