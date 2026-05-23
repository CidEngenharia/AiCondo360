import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivlxklhmnitahshlzjet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bHhrbGhtbml0YWhzaGx6amV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTgxNzcsImV4cCI6MjA4OTI3NDE3N30.ff67Pmv5dKlPu4VYiKKfiLWRfAoMUE-UYaoItOaWJY8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("\nChecking FK integrity for profiles -> condominios...");
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, condominio_id');
  const { data: condominios } = await supabase.from('condominios').select('id, name');
  const condoIds = new Set(condominios.map(c => c.id));
  
  console.log("Condominios in DB:");
  condominios.forEach(c => console.log(`  - ${c.name}: ${c.id}`));
  
  console.log("\nProfiles with condominio_id:");
  profiles.forEach(p => {
    if (p.condominio_id) {
      const exists = condoIds.has(p.condominio_id);
      console.log(`  - ${p.email} (${p.full_name}): ${p.condominio_id} [Exists: ${exists}]`);
    } else {
      console.log(`  - ${p.email} (${p.full_name}): null`);
    }
  });
}
run();
