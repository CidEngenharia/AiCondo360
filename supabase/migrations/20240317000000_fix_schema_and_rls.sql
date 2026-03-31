-- Migration to fix missing columns and RLS policies for AiCondo360

-- 1. Fixing Encomendas
ALTER TABLE encomendas 
ADD COLUMN IF NOT EXISTS resident_name TEXT,
ADD COLUMN IF NOT EXISTS resident_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS observation TEXT;

-- 2. Fixing Ocorrencias
ALTER TABLE ocorrencias 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Outros',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS messages INTEGER DEFAULT 0;

-- 3. Fixing Visitantes
ALTER TABLE visitantes 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Visitante',
ADD COLUMN IF NOT EXISTS observation TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'autorizado',
ADD COLUMN IF NOT EXISTS date TEXT,
ADD COLUMN IF NOT EXISTS time TEXT;

-- 4. Fixing Veiculos (Garagem)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='veiculos' AND column_name='owner_id') THEN
        ALTER TABLE veiculos RENAME COLUMN owner_id TO user_id;
    END IF;
END $$;

ALTER TABLE veiculos 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS observation TEXT,
ADD COLUMN IF NOT EXISTS garage_number TEXT,
ADD COLUMN IF NOT EXISTS unit_number TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'car';

-- 5. Fixing Reservas (Make times optional or default)
ALTER TABLE reservas 
ALTER COLUMN start_time DROP NOT NULL,
ALTER COLUMN end_time DROP NOT NULL;

-- 6. RLS POLICIES (Allowing users to manage their own data and condo-wide visibility)

-- Function to check if user is admin/syndic for a condo
CREATE OR REPLACE FUNCTION is_admin_of_condo(c_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND condominio_id = c_id 
    AND role IN ('admin', 'syndic', 'global_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-applying RLS safely
DO $$ 
BEGIN
    -- Encomendas
    DROP POLICY IF EXISTS "Users can see their own packages" ON encomendas;
    CREATE POLICY "Users can see their own packages" ON encomendas FOR SELECT USING (auth.uid() = user_id OR is_admin_of_condo(condominio_id));
    
    DROP POLICY IF EXISTS "Users can insert packages" ON encomendas;
    CREATE POLICY "Users can insert packages" ON encomendas FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin_of_condo(condominio_id));
    
    DROP POLICY IF EXISTS "Users can update their own packages" ON encomendas;
    CREATE POLICY "Users can update their own packages" ON encomendas FOR UPDATE USING (auth.uid() = user_id OR is_admin_of_condo(condominio_id));

    -- Ocorrencias
    DROP POLICY IF EXISTS "Users can manage their own ocorrencias" ON ocorrencias;
    CREATE POLICY "Users can manage their own ocorrencias" ON ocorrencias FOR ALL USING (auth.uid() = user_id OR is_admin_of_condo(condominio_id));

    -- Visitantes
    DROP POLICY IF EXISTS "Users can manage their own visitantes" ON visitantes;
    CREATE POLICY "Users can manage their own visitantes" ON visitantes FOR ALL USING (auth.uid() = user_id OR is_admin_of_condo(condominio_id));

    -- Veiculos
    DROP POLICY IF EXISTS "Users can manage their own veiculos" ON veiculos;
    CREATE POLICY "Users can manage their own veiculos" ON veiculos FOR ALL USING (auth.uid() = user_id OR is_admin_of_condo(condominio_id));

    -- Reservas
    DROP POLICY IF EXISTS "Users can manage their own reservas" ON reservas;
    CREATE POLICY "Users can manage their own reservas" ON reservas FOR ALL USING (auth.uid() = user_id OR is_admin_of_condo(condominio_id));

    -- Profiles (Allowing insert during signup)
    DROP POLICY IF EXISTS "Allow user to insert own profile" ON profiles;
    CREATE POLICY "Allow user to insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Allow user to update own profile" ON profiles;
    CREATE POLICY "Allow user to update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
END $$;
