import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivlxklhmnitahshlzjet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bHhrbGhtbml0YWhzaGx6amV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTgxNzcsImV4cCI6MjA4OTI3NDE3N30.ff67Pmv5dKlPu4VYiKKfiLWRfAoMUE-UYaoItOaWJY8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({
     email: 'rangel@aicondo360.com',
     password: 'senha05ai360'
  });
  if (data?.user) {
     console.log("Rangel Auth ID:", data.user.id);
     // Update profiles table!
     const { data: updateRes, error: updateErr } = await supabase.from('profiles')
        .update({ id: data.user.id }) // Try to change ID of the broken profile
        .eq('email', 'rangel@aicondo360.com');
     console.log("Update profile to true ID:", updateErr || 'Success!');
  } else {
     console.log("Login error:", error);
  }
}
run();
