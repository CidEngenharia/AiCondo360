import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivlxklhmnitahshlzjet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bHhrbGhtbml0YWhzaGx6amV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTgxNzcsImV4cCI6MjA4OTI3NDE3N30.ff67Pmv5dKlPu4VYiKKfiLWRfAoMUE-UYaoItOaWJY8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // 1. Get Verde Vale
  let { data: condo } = await supabase.from('condominios').select('id, name, plan').ilike('name', '%Verde Vale%').single();
  if (!condo) {
    console.log("Condo Verde Vale not found");
    return;
  }
  console.log("Found Condo:", condo);

  // 2. Update Adailton's profile with this condo_id
  const { data, error } = await supabase.from('profiles')
     .update({ condominio_id: condo.id })
     .eq('email', 'adailton.sindico@aicondo360.com');
  
  if (error) console.log("Update error:", error);
  else console.log("Updated successfully!");
}
run();
