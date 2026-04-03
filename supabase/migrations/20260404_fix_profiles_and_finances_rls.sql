-- Migration to fix Resident Saving and Financial management
-- Specifically for admins/syndics to manage profiles and finances

-- 1. Create Financeiro table if it doesn't exist
CREATE TABLE IF NOT EXISTS financeiro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  origem TEXT NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE boletos ENABLE ROW LEVEL SECURITY;

-- 2. Profiles RLS: Anyone authenticated can read profiles from their condo 
DROP POLICY IF EXISTS "Anyone in condo can read profiles" ON profiles;
CREATE POLICY "Anyone in condo can read profiles" ON profiles 
FOR SELECT TO authenticated 
USING (
  condominio_id IN (
    SELECT condominio_id FROM profiles WHERE id = auth.uid()
  ) OR role IN ('admin', 'syndic', 'global_admin', 'sindico', 'administrador', 'admin_global')
);

-- 3. Allow admins and syndics to manage profiles for their condo
DROP POLICY IF EXISTS "Admins and Syndics can manage residential profiles" ON profiles;
CREATE POLICY "Admins and Syndics can manage residential profiles" ON profiles 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'syndic', 'global_admin', 'sindico', 'administrador', 'admin_global')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'syndic', 'global_admin', 'sindico', 'administrador', 'admin_global')
  )
);

-- 4. Financeiro table RLS (ensure admins can manage)
DROP POLICY IF EXISTS "Admins and Syndics can manage finances" ON financeiro;
CREATE POLICY "Admins and Syndics can manage finances" ON financeiro 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'syndic', 'global_admin', 'sindico', 'administrador', 'admin_global')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'syndic', 'global_admin', 'sindico', 'administrador', 'admin_global')
  )
);

-- 5. Boletos RLS update: allow admins to manage all and users to see theirs
DROP POLICY IF EXISTS "Admins and Syndics can manage boletos" ON boletos;
CREATE POLICY "Admins and Syndics can manage boletos" ON boletos 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'syndic', 'global_admin', 'sindico', 'administrador', 'admin_global')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'syndic', 'global_admin', 'sindico', 'administrador', 'admin_global')
  )
);

DROP POLICY IF EXISTS "Users can view own boletos" ON boletos;
CREATE POLICY "Users can view own boletos" ON boletos 
FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR user_id IS NULL);

-- 6. Add missing columns to boletos if not present
ALTER TABLE boletos ADD COLUMN IF NOT EXISTS month TEXT;
ALTER TABLE boletos ALTER COLUMN user_id DROP NOT NULL;
