import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivlxklhmnitahshlzjet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bHhrbGhtbml0YWhzaGx6amV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTgxNzcsImV4cCI6MjA4OTI3NDE3N30.ff67Pmv5dKlPu4VYiKKfiLWRfAoMUE-UYaoItOaWJY8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("\nSearching for all profiles with roles...");
  let { data, error } = await supabase.from('profiles').select('full_name, role').limit(20);
  console.log("Found:", data);
}
run();
