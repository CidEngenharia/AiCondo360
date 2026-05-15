
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivlxklhmnitahshlzjet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bHhrbGhtbml0YWhzaGx6amV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTgxNzcsImV4cCI6MjA4OTI3NDE3N30.ff67Pmv5dKlPu4VYiKKfiLWRfAoMUE-UYaoItOaWJY8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  const tables = ['condominios', 'tenants', 'memberships', 'profiles'];
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' });
      console.log(`Table: ${table} | Error: ${error?.message || 'None'} | Count: ${data?.length || 0}`);
      if (data && data.length > 0) {
        console.log(`Sample from ${table}:`, data[0]);
      }
    } catch (e) {
      console.log(`Table: ${table} | Exception: ${e.message}`);
    }
  }
}

checkTables();
