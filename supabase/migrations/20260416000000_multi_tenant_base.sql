-- Multi-Tenant Migration for AiCondo360
-- Created: 2026-04-16

-- 1. Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user', -- admin, manager, user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- 3. Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC,
  stripe_price_id TEXT,
  max_users INTEGER,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add tenant_id to existing tables
DO $$
BEGIN
  ALTER TABLE condominios ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE boletos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE comunicados ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE reservas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE encomendas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE documentos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE manutencao ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE mercado ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE assembleia ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE pets ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE achados ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE enquetes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE consumo ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE visitantes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE mural_posts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE mural_comments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE financeiro ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
EXCEPTION 
  WHEN undefined_table THEN 
    NULL; -- Skip if table doesn't exist yet
END $$;

-- 6. Data Migration: Initialize Default Tenant
INSERT INTO tenants (name, slug) 
VALUES ('Default Tenant', 'default')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  default_tenant_id UUID;
BEGIN
  SELECT id INTO default_tenant_id FROM tenants WHERE slug = 'default';

  -- Associate existing data
  UPDATE condominios SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE profiles SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE boletos SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE comunicados SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE reservas SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE encomendas SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE ocorrencias SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE documentos SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE manutencao SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE mercado SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE assembleia SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE pets SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE veiculos SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE achados SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE enquetes SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE consumo SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE visitantes SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE mural_posts SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE mural_comments SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
  UPDATE financeiro SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;

  -- Create memberships for existing users
  -- Note: We map existing profile.role to membership.role
  INSERT INTO memberships (user_id, tenant_id, role)
  SELECT id, default_tenant_id, role FROM profiles
  ON CONFLICT (user_id, tenant_id) DO NOTHING;
END $$;

-- 7. Row Level Security (RLS) Isolation
-- Function to reliably get current user's tenants
CREATE OR REPLACE FUNCTION get_my_tenants()
RETURNS setof uuid AS $$
  SELECT tenant_id FROM memberships WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on core tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Apply isolation policies to ALL functional tables
DO $$
DECLARE
  t TEXT;
  tables_to_isolate TEXT[] := ARRAY[
    'condominios', 'profiles', 'boletos', 'comunicados', 'reservas', 
    'encomendas', 'ocorrencias', 'documentos', 'manutencao', 'mercado', 
    'assembleia', 'pets', 'veiculos', 'achados', 'enquetes', 
    'consumo', 'visitantes', 'mural_posts', 'mural_comments', 'financeiro'
  ];
BEGIN
  FOREACH t IN ARRAY tables_to_isolate LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_policy" ON %I', t);
    EXECUTE format('CREATE POLICY "tenant_isolation_policy" ON %I FOR ALL USING (tenant_id IN (SELECT get_my_tenants()))', t);
  END LOOP;
END $$;

-- Specific policies for new tables
CREATE POLICY "Users can view their own memberships" ON memberships FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view tenants they are members of" ON tenants FOR SELECT USING (id IN (SELECT get_my_tenants()));
CREATE POLICY "Public read for plans" ON plans FOR SELECT USING (true);
CREATE POLICY "Tenant isolation for subscriptions" ON subscriptions FOR ALL USING (tenant_id IN (SELECT get_my_tenants()));
