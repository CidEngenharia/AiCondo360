-- ============================================================
-- MIGRATION: Fix RLS UPDATE/DELETE condominios para global_admin
-- Data: 2026-06-02
-- Problema: global_admin não consegue editar nem excluir condominios
--   porque a política "condominios_write" (FOR ALL) mistura
--   regras de INSERT, UPDATE e DELETE num único bloco que falha
--   quando is_condo_admin() retorna FALSE para o global_admin.
-- Solução: separar as políticas por operação.
-- ============================================================

-- Remove políticas de escrita antigas
DROP POLICY IF EXISTS "condominios_write"        ON public.condominios;
DROP POLICY IF EXISTS "condominios_insert"       ON public.condominios;
DROP POLICY IF EXISTS "condominios_update"       ON public.condominios;
DROP POLICY IF EXISTS "condominios_delete"       ON public.condominios;

-- ── INSERT ──────────────────────────────────────────────────
-- Apenas global_admin pode criar novos condomínios
CREATE POLICY "condominios_insert" ON public.condominios
  FOR INSERT TO authenticated
  WITH CHECK (public.is_global_admin());

-- ── UPDATE ──────────────────────────────────────────────────
-- global_admin pode atualizar qualquer condomínio
CREATE POLICY "condominios_update" ON public.condominios
  FOR UPDATE TO authenticated
  USING   (public.is_global_admin())
  WITH CHECK (public.is_global_admin());

-- ── DELETE ──────────────────────────────────────────────────
-- global_admin pode excluir qualquer condomínio
CREATE POLICY "condominios_delete" ON public.condominios
  FOR DELETE TO authenticated
  USING (public.is_global_admin());

-- Recarrega cache do PostgREST
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'FIX RLS CONDOMINIOS UPDATE/DELETE CONCLUÍDO!';
  RAISE NOTICE '- INSERT: apenas global_admin';
  RAISE NOTICE '- UPDATE: global_admin pode editar qualquer condo';
  RAISE NOTICE '- DELETE: global_admin pode excluir qualquer condo';
  RAISE NOTICE '=================================================';
END $$;
