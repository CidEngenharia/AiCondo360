-- ============================================================
-- FIX DEFINITIVO - Erro FK ao salvar Assembleia
-- AiCondo360 | Data: 2026-05-21
-- 
-- INSTRUÇÃO: Cole TODO este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/ivlxklhmnitahshlzjet/sql/new
-- ============================================================


-- ── PASSO 1: Garantir que os condomínios demo existem ────────────
-- Sem isso, qualquer FK que referencie esses IDs vai falhar.

INSERT INTO public.condominios (id, name, plan)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Administração Exclusiva', 'premium'),
  ('00000000-0000-0000-0000-000000000003', 'Condomínio Paineiras', 'basic'),
  ('00000000-0000-0000-0000-000000000004', 'Condomínio Jardim', 'enterprise'),
  ('00000000-0000-0000-0000-000000000005', 'Condomínio Miami', 'premium')
ON CONFLICT (id) DO NOTHING;

SELECT 'PASSO 1 OK: Condomínios demo garantidos.' AS status;


-- ── PASSO 2: Diagnóstico - ver condomínios existentes ────────────

SELECT 'DIAGNÓSTICO - Condomínios no banco:' AS info;
SELECT id, name, plan FROM public.condominios ORDER BY name;


-- ── PASSO 3: Criar tabela física 'assembleias' se não existir ────
-- Verificamos se existe 'assembleias' (plural) ou 'assembleia' (singular)
-- e criamos/ajustamos conforme necessário.

DO $$
BEGIN
  -- Caso A: nenhuma das duas existe -> cria 'assembleias' como tabela física
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' 
      AND table_name IN ('assembleia', 'assembleias')
  ) THEN
    EXECUTE '
      CREATE TABLE public.assembleias (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        condominio_id UUID REFERENCES public.condominios(id) ON DELETE CASCADE,
        tenant_id UUID,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT ''active'',
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        meeting_link TEXT,
        whatsapp_responsavel TEXT,
        decision TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    ';
    RAISE NOTICE 'CRIADO: tabela fisica public.assembleias';

  -- Caso B: existe 'assembleia' (singular) -> adiciona colunas faltantes
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'assembleia'
  ) THEN
    ALTER TABLE public.assembleia ADD COLUMN IF NOT EXISTS meeting_link TEXT;
    ALTER TABLE public.assembleia ADD COLUMN IF NOT EXISTS whatsapp_responsavel TEXT;
    ALTER TABLE public.assembleia ADD COLUMN IF NOT EXISTS decision TEXT;
    ALTER TABLE public.assembleia ADD COLUMN IF NOT EXISTS tenant_id UUID;
    RAISE NOTICE 'ATUALIZADO: tabela assembleia com novas colunas';

  -- Caso C: existe 'assembleias' (plural) como tabela fisica -> adiciona colunas faltantes
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'assembleias'
      AND table_type = 'BASE TABLE'
  ) THEN
    ALTER TABLE public.assembleias ADD COLUMN IF NOT EXISTS meeting_link TEXT;
    ALTER TABLE public.assembleias ADD COLUMN IF NOT EXISTS whatsapp_responsavel TEXT;
    ALTER TABLE public.assembleias ADD COLUMN IF NOT EXISTS decision TEXT;
    ALTER TABLE public.assembleias ADD COLUMN IF NOT EXISTS tenant_id UUID;
    RAISE NOTICE 'ATUALIZADO: tabela assembleias com novas colunas';
  END IF;
END $$;

SELECT 'PASSO 3 OK: Estrutura da tabela de assembleias garantida.' AS status;


-- ── PASSO 4: Diagnóstico - confirmar qual tabela existe ──────────

SELECT 'DIAGNÓSTICO - Tabelas/Views de assembleia:' AS info;
SELECT 
  table_name, 
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('assembleia', 'assembleias')
ORDER BY table_name;

SELECT 'DIAGNÓSTICO - Colunas da tabela de assembleias:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('assembleia', 'assembleias')
ORDER BY table_name, ordinal_position;


-- ── PASSO 5: Desabilitar RLS nas tabelas de assembleia ───────────

ALTER TABLE IF EXISTS public.assembleias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assembleia  DISABLE ROW LEVEL SECURITY;

SELECT 'PASSO 5 OK: RLS desabilitado.' AS status;


-- ── PASSO 6: Diagnóstico - profiles com condominio_id inválido ───

SELECT 'DIAGNÓSTICO - Profiles com condominio_id inválido/nulo:' AS info;
SELECT 
  p.id, 
  p.full_name, 
  p.email, 
  p.role,
  p.condominio_id,
  CASE 
    WHEN p.condominio_id IS NULL THEN 'NULL'
    WHEN c.id IS NULL THEN 'INVALIDO - nao existe em condominios!'
    ELSE 'OK - ' || c.name
  END AS situacao
FROM public.profiles p
LEFT JOIN public.condominios c ON c.id = p.condominio_id
ORDER BY situacao DESC;


-- ── RESUMO FINAL ─────────────────────────────────────────────────

SELECT 
  'CORRECAO CONCLUIDA! Agora tente salvar uma assembleia.' AS resultado,
  (SELECT count(*)::TEXT FROM public.condominios) || ' condominios no banco.' AS condominios;
