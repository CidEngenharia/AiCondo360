-- Add contact_name to mercado_items
ALTER TABLE mercado_items ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Update existing records to have a default if possible (optional)
UPDATE mercado_items SET contact_name = author WHERE contact_name IS NULL;
