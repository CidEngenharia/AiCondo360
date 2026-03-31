-- ⚠️ FINAL DATABASE SYNC AND RLS FIX (WITH MISSING TABLES) ⚠️
-- Run this in the Supabase SQL Editor to solve all persistence issues

-- 1. Ensure UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE MISSING MURAL TABLES
CREATE TABLE IF NOT EXISTS mural_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  author_role TEXT,
  author_avatar TEXT,
  content TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'ativo', -- 'ativo', 'pendente', 'finalizado'
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mural_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES mural_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  author_role TEXT,
  author_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create helper for permissions
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'syndic', 'global_admin', 'administrador', 'sindico', 'admin_global')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Correct Table Names (Sync with Code)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mercado') THEN
        ALTER TABLE mercado RENAME TO mercado_items;
    END IF;
END $$;

-- 5. Enable RLS on all core tables
ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boletos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE encomendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mural_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mural_comments ENABLE ROW LEVEL SECURITY;

-- 6. COMPREHENSIVE POLICIES

-- CONDOMINIOS: Read-only for authenticated
DROP POLICY IF EXISTS "Select Condos" ON condominios;
CREATE POLICY "Select Condos" ON condominios FOR SELECT TO authenticated USING (true);

-- PROFILES: Select/Update own or Admin select all
DROP POLICY IF EXISTS "Manage Own Profile" ON profiles;
CREATE POLICY "Manage Own Profile" ON profiles FOR ALL TO authenticated 
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- OCORRENCIAS
DROP POLICY IF EXISTS "Manage Ocorrencias" ON ocorrencias;
CREATE POLICY "Manage Ocorrencias" ON ocorrencias FOR ALL TO authenticated 
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- ENCOMENDAS
DROP POLICY IF EXISTS "Manage Encomendas" ON encomendas;
CREATE POLICY "Manage Encomendas" ON encomendas FOR ALL TO authenticated 
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- VISITANTES
DROP POLICY IF EXISTS "Manage Visitantes" ON visitantes;
CREATE POLICY "Manage Visitantes" ON visitantes FOR ALL TO authenticated 
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- MURAL
DROP POLICY IF EXISTS "Mural Posts Access" ON mural_posts;
CREATE POLICY "Mural Posts Access" ON mural_posts FOR ALL TO authenticated 
  USING (true)
  WITH CHECK (auth.uid() = author_id OR is_admin());

DROP POLICY IF EXISTS "Mural Comments Access" ON mural_comments;
CREATE POLICY "Mural Comments Access" ON mural_comments FOR ALL TO authenticated 
  USING (true)
  WITH CHECK (auth.uid() = author_id OR is_admin());
