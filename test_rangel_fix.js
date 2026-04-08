import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivlxklhmnitahshlzjet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bHhrbGhtbml0YWhzaGx6amV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTgxNzcsImV4cCI6MjA4OTI3NDE3N30.ff67Pmv5dKlPu4VYiKKfiLWRfAoMUE-UYaoItOaWJY8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  let { data: condo } = await supabase.from('condominios').select('id, name, plan').ilike('name', '%Verde Vale%').single();
  const { data, error } = await supabase.from('profiles')
     .update({ condominio_id: condo.id })
     .ilike('full_name', '%Rangel%')
     .select('*');
  
  console.log("Updated Rangel:", data);
}
run();
