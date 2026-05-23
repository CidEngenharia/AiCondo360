import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function testInsertPlural() {
  console.log("Tentando inserir na tabela plural 'assembleias' com campos básicos...");
  const tempId = "99999999-9999-9999-9999-999999999999";
  
  // Primeiro tentamos inserir apenas campos básicos
  const { data, error } = await supabase.from('assembleias').insert([{
    id: tempId,
    condominio_id: "00000000-0000-0000-0000-000000000003", // ID válido do condomínio Paineiras
    title: "Assembleia de Teste",
    description: "Pauta teste",
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    status: 'active'
  }]);

  if (error) {
    console.error("Erro ao inserir campos básicos:", error.message);
  } else {
    console.log("Sucesso ao inserir campos básicos!");
    
    // Se funcionou, agora vamos tentar atualizar o registro com os novos campos para ver se as colunas já existem
    console.log("Tentando atualizar com meeting_link e whatsapp_responsavel...");
    const { error: updateError } = await supabase.from('assembleias').update({
      meeting_link: "https://zoom.us/test",
      whatsapp_responsavel: "11988887777"
    }).eq('id', tempId);

    if (updateError) {
      console.error("Erro ao atualizar com campos novos:", updateError.message);
    } else {
      console.log("Sucesso! As colunas novas já existem na tabela física 'assembleias'!");
    }

    // Limpa o registro de teste
    const { error: delError } = await supabase.from('assembleias').delete().eq('id', tempId);
    if (delError) console.error("Erro ao limpar registro de teste:", delError.message);
    else console.log("Registro de teste limpo com sucesso.");
  }
}

testInsertPlural();
