-- ============================================================
-- MIGRATION: Fix pets updated_at and Admin Role
-- Date: 2026-06-02
-- Description: Adds missing updated_at columns and updates admin role
-- ============================================================

-- Section 1: Dynamic check and column addition to prevent trigger failure
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'condominios','profiles','boletos','financeiro','reservas',
    'comunicados','encomendas','ocorrencias','documentos','manutencao',
    'assembleia','pets','veiculos','visitantes','achados','enquetes',
    'consumo','mural_posts','mural_comments','mercado_items'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = t AND column_name = 'updated_at'
      ) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()', t);
        RAISE NOTICE 'Added updated_at column to table %', t;
      END IF;
    END IF;
  END LOOP;
END $$;

-- Section 2: Update real admin role to global_admin in profiles table
UPDATE public.profiles
SET role = 'global_admin'
WHERE email = 'admin@aicondo360.com';
