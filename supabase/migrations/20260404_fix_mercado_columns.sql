-- Fix mercado_items table: add all required columns
-- author, unit, title, photo_url_2, photo_url_3

ALTER TABLE mercado_items 
ADD COLUMN IF NOT EXISTS author       TEXT,
ADD COLUMN IF NOT EXISTS unit         TEXT,
ADD COLUMN IF NOT EXISTS title        TEXT,
ADD COLUMN IF NOT EXISTS photo_url_2  TEXT,
ADD COLUMN IF NOT EXISTS photo_url_3  TEXT;
