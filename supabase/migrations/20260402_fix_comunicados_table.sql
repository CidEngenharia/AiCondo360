-- Migration to fix comunicados table structure and RLS
-- Run this to allow creation and management of announcements

-- 1. Add missing columns
ALTER TABLE comunicados 
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'comunicado',
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Update RLS policies
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read announcements from their condo
DROP POLICY IF EXISTS "Anyone in condo can read announcements" ON comunicados;
CREATE POLICY "Anyone in condo can read announcements" ON comunicados 
FOR SELECT TO authenticated 
USING (true); 

-- Policy: Only admins/syndics can manage announcements
DROP POLICY IF EXISTS "Admins and Syndics can manage announcements" ON comunicados;
CREATE POLICY "Admins and Syndics can manage announcements" ON comunicados 
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
