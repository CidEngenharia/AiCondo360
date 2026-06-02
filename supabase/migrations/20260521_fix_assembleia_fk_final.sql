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


-- ── PASSO 3: Diagnóstico - ver profiles com condominio_id inválido ─

SELECT 'DIAGNÓSTICO - Profiles com condominio_id inválido/nulo:' AS info;
SELECT 
  p.id, 
  p.full_name, 
  p.email, 
  p.role,
  p.condominio_id,
  CASE 
    WHEN p.condominio_id IS NULL THEN 'NULL - sem condomínio'
    WHEN c.id IS NULL THEN 'INVÁLIDO - condomínio não existe no banco!'
    ELSE 'OK - ' || c.name
  END AS situacao
FROM public.profiles p
LEFT JOIN public.condominios c ON c.id = p.condominio_id
ORDER BY situacao DESC;


-- ── PASSO 4: Corrigir profiles com condominio_id nulo ────────────
-- Se algum profile estiver com condominio_id nulo, atribuir ao Paineiras (default demo)

UPDATE public.profiles
SET condominio_id = '00000000-0000-0000-0000-000000000003'
WHERE condominio_id IS NULL
  AND role NOT IN ('global_admin', 'admin_global', 'master');

SELECT 'PASSO 4 OK: Profiles nulos corrigidos para Condomínio Paineiras.' AS status;


-- ── PASSO 5: Garantir que a view 'assembleias' existe ───────────
-- A view é usada apenas para SELECT no frontend.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'assembleias'
  ) THEN
    EXECUTE 'CREATE VIEW public.assembleias AS SELECT * FROM public.assembleia';
    RAISE NOTICE 'View assembleias criada.';
  ELSE
    -- Recriar para incluir colunas novas (meeting_link, whatsapp_responsavel, decision)
    EXECUTE 'DROP VIEW public.assembleias';
    EXECUTE 'CREATE VIEW public.assembleias AS SELECT * FROM public.assembleia';
    RAISE NOTICE 'View assembleias recriada com colunas atualizadas.';
  END IF;
END $$;

SELECT 'PASSO 5 OK: View assembleias sincronizada com tabela assembleia.' AS status;


-- ── PASSO 6: Garantir que RLS está desabilitado em assembleia ────
-- Conforme configurado em EMERGENCIA_disable_rls.sql

ALTER TABLE IF EXISTS public.assembleia DISABLE ROW LEVEL SECURITY;

SELECT 'PASSO 6 OK: RLS desabilitado na tabela assembleia.' AS status;


-- ── PASSO 7: Confirmar colunas da tabela assembleia ──────────────

SELECT 'DIAGNÓSTICO - Colunas da tabela assembleia:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'assembleia'
ORDER BY ordinal_position;


-- ── RESUMO FINAL ────────────────────────────────────────────────

SELECT 
  'CORREÇÃO CONCLUÍDA! Agora tente salvar uma assembleia na aplicação.' AS resultado,
  count(*) || ' condomínios no banco.' AS condominios
FROM public.condominios;
