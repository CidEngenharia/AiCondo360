
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkProfile() {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', 'admin@aicondo360.com').maybeSingle();
  if (error) console.error("Profile error:", error.message);
  else console.log("Profile:", JSON.stringify(data, null, 2));
}

checkProfile();
