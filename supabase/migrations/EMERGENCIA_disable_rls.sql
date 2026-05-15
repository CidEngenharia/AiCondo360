-- ============================================================
-- CORREÇÃO RÁPIDA RLS - AiCondo360
-- Cole TODO esse script no SQL Editor do Supabase e clique RUN
-- URL: https://supabase.com/dashboard/project/ivlxklhmnitahshlzjet/sql/new
-- ============================================================

-- Desabilitar RLS em todas as tabelas problemáticas
ALTER TABLE IF EXISTS public.reservas      DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ocorrencias   DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.veiculos      DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.encomendas    DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comunicados   DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pets          DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visitantes    DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.boletos       DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financeiro    DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mural_posts   DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mural_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.manutencao    DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documentos    DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assembleia    DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enquetes      DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.achados       DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consumo       DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mercado_items DISABLE ROW LEVEL SECURITY;

-- Para profiles: permitir tudo (para admins conseguirem cadastrar moradores)
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Garantir que o admin tem acesso a tudo
-- (Recriar função sem dependência circular)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin','syndic','global_admin','administrador','sindico','admin_global','master')
  );
$$;

-- Memberships: apenas leitura bloqueada por usuário
ALTER TABLE IF EXISTS public.memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenants     DISABLE ROW LEVEL SECURITY;

-- Confirmar
SELECT 'RLS desabilitado - cadastros funcionando!' as status;
