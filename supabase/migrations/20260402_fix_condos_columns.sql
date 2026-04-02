-- Migration to add missing columns to condominios table
-- Fixes "column not found" errors when saving condos

ALTER TABLE condominios 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Ensure sync with common roles
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check,
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('morador', 'administrador', 'sindico', 'admin_global', 'admin', 'syndic', 'global_admin'));
