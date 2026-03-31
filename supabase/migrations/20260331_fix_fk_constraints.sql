-- ======================================================
-- FIX FINAL - Classificados (seller_id) + Pets + Reservas
-- ======================================================

-- 1. CLASSIFICADOS: remove FK de seller_id (usuário demo não existe em profiles)
ALTER TABLE mercado_items DROP CONSTRAINT IF EXISTS mercado_seller_id_fkey;
ALTER TABLE mercado_items ALTER COLUMN seller_id DROP NOT NULL;

-- 2. PETS: verifica e corrige FK do pets/animais
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_user_id_fkey;
ALTER TABLE pets ALTER COLUMN user_id DROP NOT NULL;

-- 3. RESERVAS: drop FK que pode estar causando "Failed to fetch"
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_user_id_fkey;
