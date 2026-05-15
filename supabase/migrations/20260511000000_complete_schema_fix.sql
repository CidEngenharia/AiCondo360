-- ============================================================
-- MIGRATION: Complete Schema Fix for AiCondo360
-- Date: 2026-05-11
-- AUTOSSUFICIENTE: Cria tenants + memberships do zero
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- SECTION 1: Criar tabelas base multi-tenant (se não existirem)
-- ============================================================

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'morador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC,
  stripe_price_id TEXT,
  max_users INTEGER,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SECTION 2: Criar tenant default + garantir tenant_id nas tabelas
-- ============================================================

INSERT INTO tenants (name, slug)
VALUES ('Default', 'default')
ON CONFLICT (slug) DO NOTHING;

-- Adicionar tenant_id em cada tabela individualmente (sem loop com FK)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='condominios') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='condominios' AND column_name='tenant_id') THEN
    ALTER TABLE condominios ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='profiles') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='tenant_id') THEN
    ALTER TABLE profiles ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='boletos') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='boletos' AND column_name='tenant_id') THEN
    ALTER TABLE boletos ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='financeiro') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financeiro' AND column_name='tenant_id') THEN
    ALTER TABLE financeiro ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='reservas') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservas' AND column_name='tenant_id') THEN
    ALTER TABLE reservas ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='comunicados') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comunicados' AND column_name='tenant_id') THEN
    ALTER TABLE comunicados ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='encomendas') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='encomendas' AND column_name='tenant_id') THEN
    ALTER TABLE encomendas ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='ocorrencias') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='tenant_id') THEN
    ALTER TABLE ocorrencias ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='documentos') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documentos' AND column_name='tenant_id') THEN
    ALTER TABLE documentos ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='manutencao') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manutencao' AND column_name='tenant_id') THEN
    ALTER TABLE manutencao ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='assembleia') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assembleia' AND column_name='tenant_id') THEN
    ALTER TABLE assembleia ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='pets') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pets' AND column_name='tenant_id') THEN
    ALTER TABLE pets ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='veiculos') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='veiculos' AND column_name='tenant_id') THEN
    ALTER TABLE veiculos ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='visitantes') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='visitantes' AND column_name='tenant_id') THEN
    ALTER TABLE visitantes ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='achados') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achados' AND column_name='tenant_id') THEN
    ALTER TABLE achados ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='enquetes') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enquetes' AND column_name='tenant_id') THEN
    ALTER TABLE enquetes ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='consumo') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consumo' AND column_name='tenant_id') THEN
    ALTER TABLE consumo ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='mural_posts') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mural_posts' AND column_name='tenant_id') THEN
    ALTER TABLE mural_posts ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='mural_comments') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mural_comments' AND column_name='tenant_id') THEN
    ALTER TABLE mural_comments ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='mercado_items') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mercado_items' AND column_name='tenant_id') THEN
      ALTER TABLE mercado_items ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
  END IF;
END $$;

-- ============================================================
-- SECTION 3: Popular tenant_id e criar memberships
-- ============================================================

DO $$
DECLARE
  default_id UUID;
  t TEXT;
  tbls TEXT[] := ARRAY[
    'condominios','profiles','boletos','financeiro','reservas',
    'comunicados','encomendas','ocorrencias','documentos','manutencao',
    'assembleia','pets','veiculos','visitantes','achados','enquetes',
    'consumo','mural_posts','mural_comments','mercado_items'
  ];
BEGIN
  SELECT id INTO default_id FROM tenants WHERE slug = 'default';

  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'tenant_id'
    ) THEN
      EXECUTE format('UPDATE %I SET tenant_id = $1 WHERE tenant_id IS NULL', t)
        USING default_id;
      RAISE NOTICE 'Updated: %', t;
    ELSE
      RAISE NOTICE 'Skipped (not found): %', t;
    END IF;
  END LOOP;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    INSERT INTO memberships (user_id, tenant_id, role)
    SELECT p.id, default_id, p.role
    FROM profiles p
    WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)
    ON CONFLICT (user_id, tenant_id) DO NOTHING;
    RAISE NOTICE 'Memberships criados (somente usuarios validos)';
  END IF;
END $$;

-- ============================================================
-- SECTION 4: Adicionar updated_at onde faltar
-- ============================================================

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financeiro' AND column_name='updated_at') THEN ALTER TABLE financeiro ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservas' AND column_name='updated_at') THEN ALTER TABLE reservas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='condominios' AND column_name='updated_at') THEN ALTER TABLE condominios ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='boletos' AND column_name='updated_at') THEN ALTER TABLE boletos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); END IF; END $$;

-- ============================================================
-- SECTION 5: Trigger updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY['condominios','profiles','boletos','financeiro','reservas','comunicados','encomendas','ocorrencias','documentos','manutencao','assembleia','pets','veiculos','visitantes','achados','enquetes','consumo','mural_posts','mural_comments'];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name=t) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at_%I ON %I', t, t);
      EXECUTE format('CREATE TRIGGER trg_updated_at_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()', t, t);
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- SECTION 6: Funções auxiliares
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_tenants()
RETURNS setof uuid AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('global_admin','admin_global','master')) THEN
    RETURN QUERY SELECT id FROM tenants;
  ELSE
    RETURN QUERY SELECT tenant_id FROM memberships WHERE user_id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
    AND role IN ('admin','syndic','global_admin','administrador','sindico','admin_global','master')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- SECTION 7: Reconstruir RLS (limpa e unificada)
-- ============================================================

DO $$
DECLARE
  t TEXT;
  pol RECORD;
  tbls TEXT[] := ARRAY['condominios','profiles','boletos','financeiro','reservas','comunicados','encomendas','ocorrencias','documentos','manutencao','assembleia','pets','veiculos','visitantes','achados','enquetes','consumo','mural_posts','mural_comments'];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name=t) THEN
      FOR pol IN SELECT policyname FROM pg_policies WHERE tablename=t AND schemaname='public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, t);
      END LOOP;
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      -- Policy unificada: acesso por tenant OU fallback por condominio_id próprio
      EXECUTE format($f$
        CREATE POLICY "rls_%I" ON %I FOR ALL TO authenticated
        USING (
          tenant_id IN (SELECT get_my_tenants())
          OR tenant_id IS NULL
        )
        WITH CHECK (
          tenant_id IN (SELECT get_my_tenants())
          OR is_admin()
          OR tenant_id IS NULL
        )
      $f$, t, t);
    END IF;
  END LOOP;
END $$;

-- tenants e memberships
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenants_read" ON tenants;
CREATE POLICY "tenants_read" ON tenants FOR SELECT TO authenticated
  USING (id IN (SELECT get_my_tenants()));

DROP POLICY IF EXISTS "memberships_read" ON memberships;
CREATE POLICY "memberships_read" ON memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "memberships_manage" ON memberships;
CREATE POLICY "memberships_manage" ON memberships FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- SECTION 8: Índices de performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_financeiro_tenant   ON financeiro(tenant_id, condominio_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_date      ON financeiro(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservas_tenant      ON reservas(tenant_id, condominio_id);
CREATE INDEX IF NOT EXISTS idx_reservas_date        ON reservas(reservation_date);
CREATE INDEX IF NOT EXISTS idx_boletos_tenant       ON boletos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_boletos_user_status  ON boletos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant      ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_condo       ON profiles(condominio_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user     ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_tenant   ON memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comunicados_tenant   ON comunicados(tenant_id, condominio_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_tenant   ON ocorrencias(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_user     ON ocorrencias(user_id);

-- ============================================================
-- SECTION 9: Corrigir trigger handle_new_user
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_tenant UUID;
BEGIN
  SELECT id INTO default_tenant FROM public.tenants WHERE slug = 'default' LIMIT 1;

  INSERT INTO public.profiles (id, full_name, email, role, condominio_id, tenant_id, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'morador'),
    (new.raw_user_meta_data->>'condominio_id')::uuid,
    COALESCE((new.raw_user_meta_data->>'tenant_id')::uuid, default_tenant),
    NOW(), NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  IF default_tenant IS NOT NULL THEN
    INSERT INTO public.memberships (user_id, tenant_id, role)
    VALUES (
      new.id,
      COALESCE((new.raw_user_meta_data->>'tenant_id')::uuid, default_tenant),
      COALESCE(new.raw_user_meta_data->>'role', 'morador')
    )
    ON CONFLICT (user_id, tenant_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 10: View alias para 'assembleias' (nome plural usado no código)
-- ============================================================

DO $$
BEGIN
  -- Se for VIEW, podemos dropar e recriar
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'assembleias') THEN
    EXECUTE 'DROP VIEW public.assembleias';
    EXECUTE 'CREATE VIEW public.assembleias AS SELECT * FROM public.assembleia';
  -- Se NÃO EXISTE tabela nem view com esse nome, criamos a view
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assembleias') THEN
    EXECUTE 'CREATE VIEW public.assembleias AS SELECT * FROM public.assembleia';
  ELSE
    RAISE NOTICE 'Aviso: "assembleias" ja existe como TABELA. Ignorando criacao de view para evitar perda de dados.';
  END IF;
END $$;

-- ============================================================
-- SECTION 11: Refresh do schema cache
-- ============================================================

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'MIGRATION 20260511 CONCLUIDA COM SUCESSO';
  RAISE NOTICE 'tenants + memberships criados';
  RAISE NOTICE 'tenant_id adicionado em todas as tabelas';
  RAISE NOTICE 'RLS reconstruido';
  RAISE NOTICE 'Indices criados';
  RAISE NOTICE 'Schema cache recarregado';
END $$;
