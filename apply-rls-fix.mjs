/**
 * apply-rls-fix.mjs
 * Executa a migração RLS definitiva diretamente no Supabase via API REST.
 * 
 * USO: node apply-rls-fix.mjs <SERVICE_ROLE_KEY>
 * 
 * Para obter a SERVICE_ROLE_KEY:
 * 1. Acesse: https://supabase.com/dashboard/project/ivlxklhmnitahshlzjet/settings/api
 * 2. Copie o valor de "service_role" (secret)
 * 3. Execute: node apply-rls-fix.mjs eyJhbGciOi...
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROJECT_REF = 'ivlxklhmnitahshlzjet';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

// Pega a service key do argumento ou da env
const SERVICE_KEY = process.argv[2] || process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ ERRO: Forneça a service role key como argumento ou env SUPABASE_SERVICE_KEY');
  console.error('   Uso: node apply-rls-fix.mjs <SERVICE_ROLE_KEY>');
  console.error('   Obtenha em: https://supabase.com/dashboard/project/ivlxklhmnitahshlzjet/settings/api');
  process.exit(1);
}

// Lê o arquivo SQL
const sqlPath = join(__dirname, 'supabase', 'migrations', '20260513000000_fix_rls_definitive.sql');
let sql;
try {
  sql = readFileSync(sqlPath, 'utf-8');
  console.log(`✅ SQL carregado: ${sql.length} caracteres, ${sql.split('\n').length} linhas`);
} catch (e) {
  console.error('❌ Não foi possível ler o arquivo SQL:', e.message);
  process.exit(1);
}

// Executa via REST API do Supabase
async function runSQL() {
  console.log('\n🚀 Executando migração no Supabase...\n');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      // Tenta via Management API
      console.log('⚠️  Tentando via Management API...');
      const mgmtResponse = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_KEY}`,
          },
          body: JSON.stringify({ query: sql }),
        }
      );

      if (!mgmtResponse.ok) {
        const errText = await mgmtResponse.text();
        console.error('❌ Erro na Management API:', mgmtResponse.status, errText.substring(0, 500));
        console.log('\n📋 SOLUÇÃO MANUAL:');
        console.log('   1. Abra: https://supabase.com/dashboard/project/ivlxklhmnitahshlzjet/sql/new');
        console.log('   2. Cole o conteúdo do arquivo:');
        console.log('      supabase/migrations/20260513000000_fix_rls_definitive.sql');
        console.log('   3. Clique em Run (▶)');
        process.exit(1);
      }

      const result = await mgmtResponse.json();
      console.log('✅ MIGRAÇÃO APLICADA COM SUCESSO via Management API!');
      console.log(JSON.stringify(result, null, 2).substring(0, 500));
      return;
    }

    const result = await response.json();
    console.log('✅ MIGRAÇÃO APLICADA COM SUCESSO!');
    console.log(result);

  } catch (e) {
    console.error('❌ Erro de rede:', e.message);
    console.log('\n📋 APLIQUE O SQL MANUALMENTE:');
    console.log('   https://supabase.com/dashboard/project/ivlxklhmnitahshlzjet/sql/new');
  }
}

runSQL();
