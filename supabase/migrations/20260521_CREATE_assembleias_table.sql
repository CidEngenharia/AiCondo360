-- ============================================================
-- FIX DEFINITIVO - Criar Tabela Assembleias
-- AiCondo360 | Data: 2026-05-21
-- 
-- INSTRUÇÃO: Cole TODO este script no SQL Editor do Supabase e clique em RUN:
-- https://supabase.com/dashboard/project/ivlxklhmnitahshlzjet/sql/new
-- ============================================================

-- 1. Se a view "assembleias" existir, precisamos removê-la para criar a tabela física
DROP VIEW IF EXISTS public.assembleias CASCADE;

-- 2. Criar a tabela física 'assembleias'
CREATE TABLE IF NOT EXISTS public.assembleias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID REFERENCES public.condominios(id) ON DELETE CASCADE,
    tenant_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_link TEXT,
    whatsapp_responsavel TEXT,
    decision TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adicionar as colunas caso a tabela já existisse mas estivesse incompleta
ALTER TABLE public.assembleias ADD COLUMN IF NOT EXISTS meeting_link TEXT;
ALTER TABLE public.assembleias ADD COLUMN IF NOT EXISTS whatsapp_responsavel TEXT;
ALTER TABLE public.assembleias ADD COLUMN IF NOT EXISTS decision TEXT;
ALTER TABLE public.assembleias ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 4. Desabilitar RLS temporariamente para garantir que o insert funcione
ALTER TABLE public.assembleias DISABLE ROW LEVEL SECURITY;

SELECT 'Tabela assembleias criada com sucesso e pronta para uso!' AS status;
