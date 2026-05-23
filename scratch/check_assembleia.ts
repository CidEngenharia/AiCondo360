import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkTables() {
  console.log("Testando tabela condominios...");
  const { data: cData, error: cError } = await supabase.from('condominios').select('*').limit(1);
  if (cError) {
    console.error("Erro condominios:", cError.message);
  } else {
    console.log("Sucesso condominios! Registros:", cData);
  }

  console.log("Testando tabela assembleia (singular)...");
  const { data: aData, error: aError } = await supabase.from('assembleia').select('*').limit(1);
  if (aError) {
    console.error("Erro assembleia:", aError.message);
  } else {
    console.log("Sucesso assembleia! Registros:", aData);
  }

  console.log("Testando tabela assembleias (plural)...");
  const { data: asData, error: asError } = await supabase.from('assembleias').select('*').limit(1);
  if (asError) {
    console.error("Erro assembleias:", asError.message);
  } else {
    console.log("Sucesso assembleias! Registros:", asData);
  }
}

checkTables();
