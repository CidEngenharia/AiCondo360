-- ============================================================
-- MIGRATION: FIX GLOBAL ADMIN - AiCondo360
-- Data: 2026-05-15
-- Objetivo:
--   1. Permitir que global_admin leia TODOS os condominios
--   2. Sincronizar tabela tenants com condominios (header vs login)
--   3. Função is_global_admin dedicada para evitar ambiguidade
-- ============================================================

-- ============================================================
-- PASSO 1: Criar função dedicada para checar global_admin
-- ============================================================

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


-- ============================================================
-- PASSO 2: Recriar política condominios_select para global_admin ver tudo
-- ============================================================

DROP POLICY IF EXISTS "condominios_select" ON public.condominios;
DROP POLICY IF EXISTS "condominios_write" ON public.condominios;
DROP POLICY IF EXISTS "condominios_select_all" ON public.condominios;

-- Global admin vê TODOS. Outros veem apenas o próprio condomínio.
CREATE POLICY "condominios_select" ON public.condominios
  FOR SELECT TO authenticated
  USING (
    public.is_global_admin()
    OR id = public.get_my_condo_id()
    OR public.is_condo_admin()
  );

-- Global admin pode criar/editar/excluir qualquer condomínio
CREATE POLICY "condominios_write" ON public.condominios
  FOR ALL TO authenticated
  USING (public.is_condo_admin())
  WITH CHECK (public.is_condo_admin());


-- ============================================================
-- PASSO 3: Sincronizar tabela tenants com condominios
-- Garante que cada condôminio tenha um tenant correspondente
-- (isso corrige o mismatch entre Login e Header)
-- ============================================================

INSERT INTO public.tenants (name, slug)
SELECT
  c.name,
  -- Gera slug a partir do nome: remove acentos, espaços → hifens
  lower(
    regexp_replace(
      regexp_replace(
        translate(c.name,
          'ÁÀÃÂÄáàãâäÉÈÊËéèêëÍÌÎÏíìîïÓÒÕÔÖóòõôöÚÙÛÜúùûüÇç',
          'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCc'
        ),
        '[^a-z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  )
FROM public.condominios c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tenants t
  WHERE lower(t.name) = lower(c.name)
  OR t.id = c.id
)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- PASSO 4: Tenants select - global admin vê todos os tenants
-- ============================================================

DROP POLICY IF EXISTS "tenants_select" ON public.tenants;
DROP POLICY IF EXISTS "tenants_write" ON public.tenants;

CREATE POLICY "tenants_select" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    public.is_global_admin()
    OR id IN (SELECT tid FROM public.get_accessible_tenants())
    OR public.is_condo_admin()
  );

CREATE POLICY "tenants_write" ON public.tenants
  FOR ALL TO authenticated
  USING (public.is_condo_admin())
  WITH CHECK (public.is_condo_admin());


-- ============================================================
-- PASSO 5: Recarregar cache
-- ============================================================

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'FIX GLOBAL ADMIN CONCLUÍDO!';
  RAISE NOTICE 'Global Admin agora vê todos os condominios.';
  RAISE NOTICE 'Tenants sincronizados com condominios.';
  RAISE NOTICE '=================================================';
END $$;
