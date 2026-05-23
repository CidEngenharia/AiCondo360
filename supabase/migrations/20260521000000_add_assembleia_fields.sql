-- Adiciona colunas para link de reunião, whatsapp do responsável e decisão tomada na tabela de assembleias
-- Suporta tanto 'assembleia' (singular) quanto 'assembleias' (plural), dependendo de qual for a tabela física no banco.

DO $$ 
BEGIN
  -- 1. Se a tabela 'assembleia' (singular) existir como tabela física, adiciona as colunas nela
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'assembleia' AND table_type = 'BASE TABLE'
  ) THEN
    ALTER TABLE public.assembleia 
      ADD COLUMN IF NOT EXISTS meeting_link TEXT,
      ADD COLUMN IF NOT EXISTS whatsapp_responsavel TEXT,
      ADD COLUMN IF NOT EXISTS decision TEXT;
  END IF;

  -- 2. Se a tabela 'assembleias' (plural) existir como tabela física, adiciona as colunas nela
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'assembleias' AND table_type = 'BASE TABLE'
  ) THEN
    ALTER TABLE public.assembleias 
      ADD COLUMN IF NOT EXISTS meeting_link TEXT,
      ADD COLUMN IF NOT EXISTS whatsapp_responsavel TEXT,
      ADD COLUMN IF NOT EXISTS decision TEXT;
  END IF;

  -- 3. Se 'assembleias' for uma VIEW, recria a view para incluir as novas colunas da tabela 'assembleia'
  IF EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'assembleias'
  ) THEN
    EXECUTE 'DROP VIEW public.assembleias';
    EXECUTE 'CREATE VIEW public.assembleias AS SELECT * FROM public.assembleia';
  END IF;
END $$;
