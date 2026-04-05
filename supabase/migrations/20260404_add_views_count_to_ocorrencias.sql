-- Adiciona campo views_count se não existir na tabela ocorrencias
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias' AND column_name = 'views_count') THEN
        ALTER TABLE ocorrencias ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
END $$;
