import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivlxklhmnitahshlzjet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bHhrbGhtbml0YWhzaGx6amV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTgxNzcsImV4cCI6MjA4OTI3NDE3N30.ff67Pmv5dKlPu4VYiKKfiLWRfAoMUE-UYaoItOaWJY8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const ids = [
    '00000000-0000-0000-0000-000000000003',
    '7ac17628-6a74-4599-931c-39dc90f995f4',
    'ea85171f-1762-4767-884f-08e1a778be55'
  ];

  for (const id of ids) {
    console.log(`\nTesting insert for condominio_id: ${id}`);
    const { data, error } = await supabase.from('assembleias').insert([{
      condominio_id: id,
      title: 'Assembleia Teste Automatizado',
      description: 'Discussão de melhorias e aprovação de contas.',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 3600000).toISOString(),
      status: 'active'
    }]).select();

    if (error) {
      console.error(`Result for ${id}:`, error.message, error.details || '');
    } else {
      console.log(`Success for ${id}! Inserted:`, data);
      // clean up
      await supabase.from('assembleias').delete().eq('id', data[0].id);
    }
  }
}
run();
