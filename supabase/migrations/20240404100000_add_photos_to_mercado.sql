-- Migration to add multiple photos to mercado_items table
ALTER TABLE mercado_items 
ADD COLUMN IF NOT EXISTS photo_url_2 TEXT, 
ADD COLUMN IF NOT EXISTS photo_url_3 TEXT;

-- Just in case author/unit are still missing (to resolve user's reported error permanently)
ALTER TABLE mercado_items 
ADD COLUMN IF NOT EXISTS author TEXT, 
ADD COLUMN IF NOT EXISTS unit TEXT;
