-- ============================================================
-- MIGRATION: Add end_date and requester_name to reservas
-- Date: 2026-06-02
-- Description: Adds missing columns to the reservas table and migrates old demo records
-- ============================================================

-- Section 1: Add columns if they do not exist
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS requester_name TEXT;
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS late_fee_per_hour NUMERIC DEFAULT 50;
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS total_late_fee NUMERIC DEFAULT 0;

-- Section 2: Reassociate existing demo bookings to the real admin ID
UPDATE public.reservas
SET user_id = '65d16f39-6e22-4fb6-b83e-2821ce8951db'
WHERE user_id = '00000000-0000-0000-0000-00000000000a';

-- Section 3: Reload schema cache
NOTIFY pgrst, 'reload schema';
