-- ============================================================
-- MIGRATION: RPCs SECURITY DEFINER para editar/excluir condomínio
-- Data: 2026-06-02
-- Problema: global_admin não tem SERVICE_KEY no frontend,
--   por isso UPDATE e DELETE são bloqueados pelo RLS mesmo com
--   fallback de adminClient (que usa anon key, não service key).
-- Solução: funções RPC com SECURITY DEFINER que rodam como
--   o superusuário do banco e verificam a role do caller.
-- ============================================================

-- ── UPDATE ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_update_condominio(
  p_id       uuid,
  p_name     text        DEFAULT NULL,
  p_address  text        DEFAULT NULL,
  p_cnpj     text        DEFAULT NULL,
  p_plan     text        DEFAULT NULL,
  p_status   text        DEFAULT NULL,
  p_syndic_name  text    DEFAULT NULL,
  p_syndic_phone text    DEFAULT NULL,
  p_late_fee_per_hour numeric DEFAULT NULL
)
RETURNS public.condominios
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result public.condominios;
BEGIN
  -- Apenas global_admin pode chamar esta função
  IF NOT public.is_global_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas global_admin pode editar condominios';
  END IF;

  UPDATE public.condominios SET
    name               = COALESCE(p_name,               name),
    address            = COALESCE(p_address,            address),
    cnpj               = COALESCE(p_cnpj,               cnpj),
    plan               = COALESCE(p_plan,               plan),
    status             = COALESCE(p_status,             status),
    syndic_name        = COALESCE(p_syndic_name,        syndic_name),
    syndic_phone       = COALESCE(p_syndic_phone,       syndic_phone),
    late_fee_per_hour  = COALESCE(p_late_fee_per_hour,  late_fee_per_hour)
  WHERE id = p_id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- ── DELETE ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_delete_condominio(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_global_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas global_admin pode excluir condominios';
  END IF;

  DELETE FROM public.condominios WHERE id = p_id;
END;
$$;

-- Concede execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.admin_update_condominio TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_condominio TO authenticated;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'RPCs admin_update_condominio e admin_delete_condominio criadas!';
  RAISE NOTICE 'SECURITY DEFINER bypassa RLS - global_admin verificado internamente';
  RAISE NOTICE '=================================================';
END $$;
