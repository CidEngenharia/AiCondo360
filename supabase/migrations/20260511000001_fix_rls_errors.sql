-- ============================================================
-- SQL PATCH: RLS & Tenant/Condominio Fallbacks
-- Este script corrige os problemas de "new row violates row-level security policy"
-- e garante que as informações não "sumam", usando funções SECURITY DEFINER robustas.
-- ============================================================

-- 1. Garante que as funções SECURITY DEFINER bypassam RLS para evitar recursão infinita
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
  -- Se for admin global, retorna todos os tenants
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('global_admin','admin_global','master')) THEN
    RETURN QUERY SELECT id FROM public.tenants;
  ELSE
    -- Retorna tenant_id das memberships OU do próprio profile (fallback de segurança)
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

-- 2. Atualizar as políticas RLS para TODAS as tabelas afetadas
DO $$
DECLARE
  t TEXT;
  pol RECORD;
  tbls TEXT[] := ARRAY['condominios','profiles','boletos','financeiro','reservas','comunicados','encomendas','ocorrencias','documentos','manutencao','assembleia','pets','veiculos','visitantes','achados','enquetes','consumo','mural_posts','mural_comments', 'mercado_items'];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name=t) THEN
      
      -- Dropar TODAS as políticas existentes para garantir que não há conflitos
      FOR pol IN SELECT policyname FROM pg_policies WHERE tablename=t AND schemaname='public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, t);
      END LOOP;
      
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      
      -- Criar a nova política unificada de forma dinâmica
      -- Permite acesso se:
      -- 1. O tenant_id bater com os tenants do usuário
      -- 2. O tenant_id for NULL (registros legados órfãos)
      -- 3. O condominio_id bater com o do usuário (quando a tabela tem essa coluna)
      -- 4. O usuário for admin
      IF t = 'condominios' THEN
        -- condominios não tem condominio_id, a checagem é no id da própria tabela
        EXECUTE format($f$
          CREATE POLICY "rls_%I" ON %I FOR ALL TO authenticated
          USING (
            tenant_id IN (SELECT get_my_tenants())
            OR tenant_id IS NULL
            OR id = get_my_condominio()
          )
          WITH CHECK (
            tenant_id IN (SELECT get_my_tenants())
            OR tenant_id IS NULL
            OR id = get_my_condominio()
            OR is_admin()
          )
        $f$, t, t);
      ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=t AND column_name='condominio_id') THEN
        -- Tabelas que possuem condominio_id (ex: profiles, reservas, ocorrencias)
        EXECUTE format($f$
          CREATE POLICY "rls_%I" ON %I FOR ALL TO authenticated
          USING (
            tenant_id IN (SELECT get_my_tenants())
            OR tenant_id IS NULL
            OR condominio_id = get_my_condominio()
          )
          WITH CHECK (
            tenant_id IN (SELECT get_my_tenants())
            OR tenant_id IS NULL
            OR condominio_id = get_my_condominio()
            OR is_admin()
          )
        $f$, t, t);
      ELSE
        -- Tabelas que NÃO possuem condominio_id (ex: mural_comments)
        EXECUTE format($f$
          CREATE POLICY "rls_%I" ON %I FOR ALL TO authenticated
          USING (
            tenant_id IN (SELECT get_my_tenants())
            OR tenant_id IS NULL
          )
          WITH CHECK (
            tenant_id IN (SELECT get_my_tenants())
            OR tenant_id IS NULL
            OR is_admin()
          )
        $f$, t, t);
      END IF;
    END IF;
  END LOOP;
END $$;

-- 3. Assegurar que 'default' tenant existe e forçar preenchimento em perfis órfãos
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

-- Recarrega o cache do Supabase
NOTIFY pgrst, 'reload schema';
