-- ============================================================
-- MIGRATION: Fix RLS condominios para global_admin
-- Data: 2026-05-15
-- Problema: global_admin não consegue listar condominios porque:
--   1. A política só permite authenticated (bloqueia cliente anon)
--   2. is_condo_admin() requer condominio_id no perfil, mas global_admin não tem
-- ============================================================

-- 1. Remove políticas antigas da tabela condominios
DROP POLICY IF EXISTS "condominios_select" ON public.condominios;
DROP POLICY IF EXISTS "condominios_write"  ON public.condominios;

-- 2. Recria função is_global_admin (SECURITY DEFINER - bypassa RLS)
CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('global_admin', 'admin_global', 'master')
  );
$$;

-- 3. Recria função get_all_condominios_for_admin (SECURITY DEFINER - bypassa RLS)
--    Usada como fallback RPC no frontend
CREATE OR REPLACE FUNCTION public.get_all_condominios_for_admin()
RETURNS SETOF public.condominios
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Só executa se o usuário for global_admin
  IF public.is_global_admin() THEN
    RETURN QUERY SELECT * FROM public.condominios ORDER BY name;
  ELSE
    RAISE EXCEPTION 'Acesso negado: apenas global_admin pode usar esta função';
  END IF;
END;
$$;

-- 4. Nova política SELECT para condominios:
--    - anon: pode listar (necessário para tela de login e cliente anon do global_admin)
--    - authenticated normal: só vê o próprio condomínio
--    - global_admin: vê todos
CREATE POLICY "condominios_select_anon" ON public.condominios
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "condominios_select_auth" ON public.condominios
  FOR SELECT TO authenticated
  USING (
    public.is_global_admin()
    OR id = public.get_my_condo_id()
    OR public.is_condo_admin()
  );

-- 5. Política de escrita permanece apenas para admins autenticados
CREATE POLICY "condominios_write" ON public.condominios
  FOR ALL TO authenticated
  USING (public.is_condo_admin() OR public.is_global_admin())
  WITH CHECK (public.is_condo_admin() OR public.is_global_admin());

-- 6. Recarrega cache do PostgREST
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'FIX RLS CONDOMINIOS CONCLUÍDO!';
  RAISE NOTICE '- anon pode listar condominios (login + admin anon client)';
  RAISE NOTICE '- global_admin pode listar todos os condominios';
  RAISE NOTICE '- RPC get_all_condominios_for_admin recriada';
  RAISE NOTICE '=================================================';
END $$;
