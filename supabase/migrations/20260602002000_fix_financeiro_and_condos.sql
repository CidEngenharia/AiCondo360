-- ============================================================
-- MIGRATION: Fix financeiro table columns + late_fee_per_hour in condominios
-- Date: 2026-06-02
-- Description: Adds missing columns required by FinanceiroService.createExpense
--              and finishReserva to avoid column-not-found errors.
-- ============================================================

-- Section 1: Add missing columns to 'financeiro'
ALTER TABLE public.financeiro ADD COLUMN IF NOT EXISTS user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.financeiro ADD COLUMN IF NOT EXISTS tipo        TEXT DEFAULT 'receita';   -- 'receita' | 'despesa'
ALTER TABLE public.financeiro ADD COLUMN IF NOT EXISTS status      TEXT DEFAULT 'pendente';  -- 'pendente' | 'pago' | 'cancelado'
ALTER TABLE public.financeiro ADD COLUMN IF NOT EXISTS categoria   TEXT;
ALTER TABLE public.financeiro ADD COLUMN IF NOT EXISTS tenant_id   UUID REFERENCES public.tenants(id) ON DELETE SET NULL;

-- Section 2: Add late_fee_per_hour to condominios (valor padrão R$50/hora)
ALTER TABLE public.condominios ADD COLUMN IF NOT EXISTS late_fee_per_hour NUMERIC DEFAULT 50;

-- Section 3: Reload schema cache so PostgREST picks up the new columns
NOTIFY pgrst, 'reload schema';
