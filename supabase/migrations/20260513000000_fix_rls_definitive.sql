-- ============================================================
-- MIGRATION: RLS DEFINITIVO - AiCondo360
-- Data: 2026-05-13
-- Objetivo: Corrigir "new row violates row-level security policy"
-- em TODAS as tabelas (profiles, veiculos, encomendas, reservas...)
--
-- INSTRUÇÃO: Copie e cole TODO esse script no SQL Editor do Supabase.
-- ============================================================

-- ============================================================
-- PASSO 1: Garantir tenant default e memberships válidos
-- ============================================================

INSERT INTO public.tenants (name, slug)
VALUES ('Default', 'default')
ON CONFLICT (slug) DO NOTHING;

-- Garantir que todos os profiles têm tenant_id preenchido
DO $$
DECLARE
  default_id UUID;
BEGIN
  SELECT id INTO default_id FROM public.tenants WHERE slug = 'default';

  -- Preencher tenant_id nulo em profiles
  UPDATE public.profiles
  SET tenant_id = default_id
  WHERE tenant_id IS NULL;

  -- Preencher tenant_id nulo em todas as outras tabelas
  UPDATE public.boletos     SET tenant_id = default_id WHERE tenant_id IS NULL;
  UPDATE public.financeiro  SET tenant_id = default_id WHERE tenant_id IS NULL;
  UPDATE public.reservas    SET tenant_id = default_id WHERE tenant_id IS NULL;
  UPDATE public.comunicados SET tenant_id = default_id WHERE tenant_id IS NULL;
  UPDATE public.encomendas  SET tenant_id = default_id WHERE tenant_id IS NULL;
  UPDATE public.ocorrencias SET tenant_id = default_id WHERE tenant_id IS NULL;
  UPDATE public.veiculos    SET tenant_id = default_id WHERE tenant_id IS NULL;
  UPDATE public.pets        SET tenant_id = default_id WHERE tenant_id IS NULL;
  UPDATE public.visitantes  SET tenant_id = default_id WHERE tenant_id IS NULL;
  UPDATE public.mural_posts SET tenant_id = default_id WHERE tenant_id IS NULL;
  UPDATE public.mural_comments SET tenant_id = default_id WHERE tenant_id IS NULL;

  -- Criar memberships para profiles que ainda não têm
  INSERT INTO public.memberships (user_id, tenant_id, role)
  SELECT p.id, COALESCE(p.tenant_id, default_id), p.role
  FROM public.profiles p
  WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)
  ON CONFLICT (user_id, tenant_id) DO NOTHING;

  RAISE NOTICE 'PASSO 1 CONCLUÍDO: tenants e memberships normalizados.';
END $$;


-- ============================================================
-- PASSO 2: Recriar funções auxiliares (SECURITY DEFINER)
-- ============================================================

-- Função: retorna true se o usuário logado é admin/síndico
CREATE OR REPLACE FUNCTION public.is_condo_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN (
      'admin', 'syndic', 'global_admin',
      'administrador', 'sindico', 'admin_global', 'master'
    )
  );
$$;

-- Função: retorna o condominio_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_my_condo_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT condominio_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Função: retorna os tenant_ids que o usuário tem acesso
CREATE OR REPLACE FUNCTION public.get_accessible_tenants()
RETURNS TABLE(tid uuid)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Global admins veem todos os tenants
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('global_admin', 'admin_global', 'master')
  ) THEN
    RETURN QUERY SELECT id AS tid FROM public.tenants;
  ELSE
    -- Usuários normais veem apenas seus tenants via memberships
    RETURN QUERY
      SELECT tenant_id AS tid FROM public.memberships WHERE user_id = auth.uid()
      UNION
      SELECT tenant_id AS tid FROM public.profiles WHERE id = auth.uid() AND tenant_id IS NOT NULL;
  END IF;
END;
$$;

DO $$
BEGIN
  RAISE NOTICE 'PASSO 2 CONCLUÍDO: funções auxiliares criadas.';
END $$;


-- ============================================================
-- PASSO 3: Remover TODAS as políticas existentes
-- ============================================================

DO $$
DECLARE
  t TEXT;
  pol RECORD;
  tbls TEXT[] := ARRAY[
    'condominios', 'profiles', 'boletos', 'financeiro', 'reservas',
    'comunicados', 'encomendas', 'ocorrencias', 'documentos', 'manutencao',
    'assembleia', 'pets', 'veiculos', 'visitantes', 'achados', 'enquetes',
    'consumo', 'mural_posts', 'mural_comments', 'mercado_items',
    'tenants', 'memberships'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      FOR pol IN
        SELECT policyname FROM pg_policies
        WHERE tablename = t AND schemaname = 'public'
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
      END LOOP;
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
  RAISE NOTICE 'PASSO 3 CONCLUÍDO: todas as políticas removidas.';
END $$;


-- ============================================================
-- PASSO 4: Recriar políticas por tabela (sem dependência circular)
-- ============================================================

-- ── PROFILES ──────────────────────────────────────────────────
-- SELECT: qualquer autenticado vê perfis do mesmo condomínio
-- INSERT/UPDATE/DELETE: admins podem tudo; usuário vê/edita o próprio
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR condominio_id = public.get_my_condo_id()
    OR public.is_condo_admin()
  );

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Admin pode cadastrar qualquer perfil no mesmo condomínio
    public.is_condo_admin()
    -- OU o próprio usuário criando seu perfil
    OR id = auth.uid()
    -- OU inserção com tenant_id válido (para novos usuários sem perfil ainda)
    OR tenant_id IN (SELECT tid FROM public.get_accessible_tenants())
  );

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR public.is_condo_admin()
  )
  WITH CHECK (
    id = auth.uid()
    OR public.is_condo_admin()
  );

CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    id = auth.uid()
    OR public.is_condo_admin()
  );


-- ── CONDOMINIOS ────────────────────────────────────────────────
CREATE POLICY "condominios_select" ON public.condominios
  FOR SELECT TO authenticated
  USING (
    id = public.get_my_condo_id()
    OR public.is_condo_admin()
  );

CREATE POLICY "condominios_write" ON public.condominios
  FOR ALL TO authenticated
  USING (public.is_condo_admin())
  WITH CHECK (public.is_condo_admin());


-- ── MACRO: Política padrão para tabelas com condominio_id ──────
-- Aplica a: boletos, financeiro, reservas, comunicados, encomendas,
--           ocorrencias, documentos, manutencao, assembleia, pets,
--           veiculos, visitantes, achados, enquetes, consumo, mural_posts, mercado_items

DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'boletos', 'financeiro', 'reservas', 'comunicados', 'encomendas',
    'ocorrencias', 'documentos', 'manutencao', 'assembleia', 'pets',
    'veiculos', 'visitantes', 'achados', 'enquetes', 'consumo',
    'mural_posts', 'mercado_items'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      -- SELECT: mesma condomínio OU admin
      EXECUTE format($f$
        CREATE POLICY "rls_%1$s_select" ON public.%1$I
        FOR SELECT TO authenticated
        USING (
          condominio_id = public.get_my_condo_id()
          OR public.is_condo_admin()
          OR tenant_id IN (SELECT tid FROM public.get_accessible_tenants())
        )
      $f$, t);

      -- INSERT: mesmo condomínio OU admin
      EXECUTE format($f$
        CREATE POLICY "rls_%1$s_insert" ON public.%1$I
        FOR INSERT TO authenticated
        WITH CHECK (
          condominio_id = public.get_my_condo_id()
          OR public.is_condo_admin()
          OR tenant_id IN (SELECT tid FROM public.get_accessible_tenants())
        )
      $f$, t);

      -- UPDATE: mesmo condomínio OU admin
      EXECUTE format($f$
        CREATE POLICY "rls_%1$s_update" ON public.%1$I
        FOR UPDATE TO authenticated
        USING (
          condominio_id = public.get_my_condo_id()
          OR public.is_condo_admin()
        )
        WITH CHECK (
          condominio_id = public.get_my_condo_id()
          OR public.is_condo_admin()
        )
      $f$, t);

      -- DELETE: mesmo condomínio OU admin
      EXECUTE format($f$
        CREATE POLICY "rls_%1$s_delete" ON public.%1$I
        FOR DELETE TO authenticated
        USING (
          condominio_id = public.get_my_condo_id()
          OR public.is_condo_admin()
        )
      $f$, t);

      RAISE NOTICE 'Políticas criadas para: %', t;
    ELSE
      RAISE NOTICE 'Tabela não encontrada (ignorada): %', t;
    END IF;
  END LOOP;
END $$;


-- ── MURAL_COMMENTS (sem condominio_id direto) ──────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'mural_comments'
  ) THEN
    CREATE POLICY "rls_mural_comments_select" ON public.mural_comments
    FOR SELECT TO authenticated
    USING (
      tenant_id IN (SELECT tid FROM public.get_accessible_tenants())
      OR public.is_condo_admin()
    );

    CREATE POLICY "rls_mural_comments_insert" ON public.mural_comments
    FOR INSERT TO authenticated
    WITH CHECK (
      author_id = auth.uid()
      OR public.is_condo_admin()
    );

    CREATE POLICY "rls_mural_comments_update" ON public.mural_comments
    FOR UPDATE TO authenticated
    USING (author_id = auth.uid() OR public.is_condo_admin())
    WITH CHECK (author_id = auth.uid() OR public.is_condo_admin());

    CREATE POLICY "rls_mural_comments_delete" ON public.mural_comments
    FOR DELETE TO authenticated
    USING (author_id = auth.uid() OR public.is_condo_admin());

    RAISE NOTICE 'Políticas criadas para: mural_comments';
  END IF;
END $$;


-- ── TENANTS ────────────────────────────────────────────────────
CREATE POLICY "tenants_select" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT tid FROM public.get_accessible_tenants())
    OR public.is_condo_admin()
  );

CREATE POLICY "tenants_write" ON public.tenants
  FOR ALL TO authenticated
  USING (public.is_condo_admin())
  WITH CHECK (public.is_condo_admin());


-- ── MEMBERSHIPS ────────────────────────────────────────────────
CREATE POLICY "memberships_select" ON public.memberships
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_condo_admin()
  );

CREATE POLICY "memberships_write" ON public.memberships
  FOR ALL TO authenticated
  USING (public.is_condo_admin())
  WITH CHECK (public.is_condo_admin());


-- ============================================================
-- PASSO 5: Recarregar cache do PostgREST
-- ============================================================

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'MIGRAÇÃO RLS DEFINITIVA CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE 'Tabelas corrigidas: profiles, veiculos, encomendas,';
  RAISE NOTICE 'reservas, comunicados, pets, visitantes, ocorrencias,';
  RAISE NOTICE 'boletos, financeiro, mural_posts, mural_comments, etc.';
  RAISE NOTICE '=================================================';
END $$;
