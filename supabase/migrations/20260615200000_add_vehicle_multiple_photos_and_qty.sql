-- Migration to add multiple photos support, resident car qty and model details to veiculos
ALTER TABLE public.veiculos 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS resident_car_qty INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS resident_car_models TEXT;
