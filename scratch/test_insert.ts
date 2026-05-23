import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function testInsert() {
  console.log("Tentando inserir assembleia com novos campos...");
  const tempId = "99999999-9999-9999-9999-999999999999";
  const { data, error } = await supabase.from('assembleia').insert([{
    id: tempId,
    condominio_id: "00000000-0000-0000-0000-000000000001",
    title: "Assembleia de Teste das Colunas",
    description: "Verificando se os campos novos existem no banco",
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    meeting_link: "https://zoom.us/test",
    whatsapp_responsavel: "11988887777",
    decision: "Decidimos que as colunas existem."
  }]);

  if (error) {
    console.error("Erro ao inserir:", error.message);
  } else {
    console.log("Inserção bem sucedida! As colunas já existem no banco de dados.");
    // Deleta o registro de teste
    const { error: delError } = await supabase.from('assembleia').delete().eq('id', tempId);
    if (delError) console.error("Erro ao deletar registro de teste:", delError.message);
    else console.log("Registro de teste deletado com sucesso.");
  }
}

testInsert();
