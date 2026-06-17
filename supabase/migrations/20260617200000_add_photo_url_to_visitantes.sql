-- Migration: Add photo_url column to visitantes table
-- Date: 2026-06-17
-- Description: Add photo_url field to support visitor/service provider photo storage

ALTER TABLE visitantes
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

COMMENT ON COLUMN visitantes.photo_url IS 'Base64 encoded photo of the visitor or service provider';
