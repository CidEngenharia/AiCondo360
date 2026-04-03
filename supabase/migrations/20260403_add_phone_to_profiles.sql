-- Migration to add phone and building to profiles table
-- Fixes missing contact info and unit location for Residents module

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS building TEXT;
