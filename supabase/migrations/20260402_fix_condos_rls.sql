-- Migration to allow management of condominios by administrators
-- Fixes the error when creating or editing condos in the global panel

-- 1. Update RLS policies for condominios
ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read condo info (already exists as "Select Condos", but let's be thorough)
DROP POLICY IF EXISTS "Select Condos" ON condominios;
CREATE POLICY "Select Condos" ON condominios FOR SELECT TO authenticated USING (true);

-- Policy: Admin Global can manage all condos
DROP POLICY IF EXISTS "Global admins can manage all condos" ON condominios;
CREATE POLICY "Global admins can manage all condos" ON condominios 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('global_admin', 'admin_global')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('global_admin', 'admin_global')
  )
);

-- Policy: Syndics can update their own condo
DROP POLICY IF EXISTS "Syndics can update their own condo" ON condominios;
CREATE POLICY "Syndics can update their own condo" ON condominios 
FOR UPDATE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('syndic', 'sindico')
    AND condominio_id = condominios.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('syndic', 'sindico')
    AND condominio_id = condominios.id
  )
);
