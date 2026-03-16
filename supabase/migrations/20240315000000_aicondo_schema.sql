-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Condominios
CREATE TABLE IF NOT EXISTS condominios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'basic', -- basic, enterprise, premium
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles (Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  condominio_id UUID REFERENCES condominios(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'morador', -- morador, administrador, sindico, admin_global
  full_name TEXT,
  email TEXT,
  unit TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Boletos
CREATE TABLE IF NOT EXISTS boletos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, overdue
  due_date DATE NOT NULL,
  barcode TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Comunicados
CREATE TABLE IF NOT EXISTS comunicados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Reservas
CREATE TABLE IF NOT EXISTS reservas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  area_name TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Encomendas
CREATE TABLE IF NOT EXISTS encomendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'arrived', -- arrived, delivered
  tracking_code TEXT,
  photo_url TEXT,
  arrival_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Ocorrencias
CREATE TABLE IF NOT EXISTS ocorrencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- open, in_progress, resolved
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Manutencao
CREATE TABLE IF NOT EXISTS manutencao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed
  scheduled_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Mercado Interno
CREATE TABLE IF NOT EXISTS mercado (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Assembleia
CREATE TABLE IF NOT EXISTS assembleia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active', -- active, closed
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Pets
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  breed TEXT,
  photo_url TEXT,
  vaccination_status TEXT DEFAULT 'up_to_date',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Veiculos
CREATE TABLE IF NOT EXISTS veiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,
  model TEXT,
  color TEXT,
  spot TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Achados
CREATE TABLE IF NOT EXISTS achados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  finder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'found', -- found, returned
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Enquetes
CREATE TABLE IF NOT EXISTS enquetes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Consumo
CREATE TABLE IF NOT EXISTS consumo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- agua, energia, gas
  value DECIMAL(10, 2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Visitantes
CREATE TABLE IF NOT EXISTS visitantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rg TEXT,
  arrival_date TIMESTAMP WITH TIME ZONE,
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic examples for global tenant isolation
ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boletos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE encomendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencao ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercado ENABLE ROW LEVEL SECURITY;
ALTER TABLE assembleia ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE achados ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumo ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone on condominios
CREATE POLICY "Public read condominios"
  ON condominios FOR SELECT USING (true);

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

-- Trigger to create profile after Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
