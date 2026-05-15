-- ============================================================
-- SQL PATCH: RLS & Tenant/Condominio Fallbacks (Explicit Mapping)
-- Este script substitui a versão anterior, mapeando explicitamente as tabelas
-- que possuem ou não a coluna condominio_id, evitando erros de leitura
-- do information_schema que causaram falhas em tabelas como mural_comments.
-- ============================================================

-- 1. Cria ou recria as funções SECURITY DEFINER de forma limpa
CREATE OR REPLACE FUNCTION get_my_condominio()
RETURNS uuid AS $$
DECLARE
  condo_id uuid;
BEGIN
  SELECT condominio_id INTO condo_id FROM public.profiles WHERE id = auth.uid();
  RETURN condo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_tenants()
RETURNS setof uuid AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('global_admin','admin_global','master')) THEN
    RETURN QUERY SELECT id FROM public.tenants;
  ELSE
    RETURN QUERY 
      SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid()
      UNION
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND tenant_id IS NOT NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid()
    AND role IN ('admin','syndic','global_admin','administrador','sindico','admin_global','master')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Limpar todas as políticas de forma dinâmica
DO $$
DECLARE
  t TEXT;
  pol RECORD;
  tbls TEXT[] := ARRAY['condominios','profiles','boletos','financeiro','reservas','comunicados','encomendas','ocorrencias','documentos','manutencao','assembleia','pets','veiculos','visitantes','achados','enquetes','consumo','mural_posts','mural_comments', 'mercado_items'];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      FOR pol IN SELECT policyname FROM pg_policies WHERE tablename=t AND schemaname='public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, t);
      END LOOP;
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- 3. Políticas para tabela 'condominios' (usa id próprio)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='condominios') THEN
    EXECUTE $f$
      CREATE POLICY "rls_condominios" ON condominios FOR ALL TO authenticated
      USING (
        tenant_id IN (SELECT get_my_tenants())
        OR tenant_id IS NULL
        OR id = get_my_condominio()
        OR is_admin()
      )
      WITH CHECK (
        tenant_id IN (SELECT get_my_tenants())
        OR tenant_id IS NULL
        OR id = get_my_condominio()
        OR is_admin()
      );
    $f$;
  END IF;
END $$;

-- 4. Políticas para tabelas COM 'condominio_id'
DO $$
DECLARE
  t TEXT;
  -- Lista explícita de tabelas que SABEMOS ter a coluna condominio_id
  tbls_with_condominio TEXT[] := ARRAY['profiles','boletos','financeiro','reservas','comunicados','encomendas','ocorrencias','documentos','manutencao','assembleia','pets','veiculos','visitantes','achados','enquetes','consumo','mural_posts','mercado_items'];
BEGIN
  FOREACH t IN ARRAY tbls_with_condominio LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format($f$
        CREATE POLICY "rls_%I" ON %I FOR ALL TO authenticated
        USING (
          tenant_id IN (SELECT get_my_tenants())
          OR tenant_id IS NULL
          OR condominio_id = get_my_condominio()
          OR is_admin()
        )
        WITH CHECK (
          tenant_id IN (SELECT get_my_tenants())
          OR tenant_id IS NULL
          OR condominio_id = get_my_condominio()
          OR is_admin()
        )
      $f$, t, t);
    END IF;
  END LOOP;
END $$;

-- 5. Políticas para tabelas SEM 'condominio_id'
DO $$
DECLARE
  t TEXT;
  -- Lista explícita de tabelas que SABEMOS NÃO ter a coluna condominio_id
  tbls_without_condominio TEXT[] := ARRAY['mural_comments'];
BEGIN
  FOREACH t IN ARRAY tbls_without_condominio LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format($f$
        CREATE POLICY "rls_%I" ON %I FOR ALL TO authenticated
        USING (
          tenant_id IN (SELECT get_my_tenants())
          OR tenant_id IS NULL
          OR is_admin()
        )
        WITH CHECK (
          tenant_id IN (SELECT get_my_tenants())
          OR tenant_id IS NULL
          OR is_admin()
        )
      $f$, t, t);
    END IF;
  END LOOP;
END $$;

-- 6. Assegurar tenant 'default' e integridade de perfis
DO $$
DECLARE
  default_id UUID;
BEGIN
  INSERT INTO public.tenants (name, slug) VALUES ('Default', 'default') ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO default_id FROM public.tenants WHERE slug = 'default';
  
  -- Corrige profiles que por algum motivo estão com tenant_id null
  UPDATE public.profiles SET tenant_id = default_id WHERE tenant_id IS NULL;
  
  -- Tenta criar memberships para todo mundo que não tem
  INSERT INTO public.memberships (user_id, tenant_id, role)
  SELECT p.id, COALESCE(p.tenant_id, default_id), p.role
  FROM public.profiles p
  WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)
  ON CONFLICT (user_id, tenant_id) DO NOTHING;
END $$;

-- 7. Recarrega cache do Supabase
NOTIFY pgrst, 'reload schema';
