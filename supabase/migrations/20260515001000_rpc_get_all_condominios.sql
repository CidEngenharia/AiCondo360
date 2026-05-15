-- ============================================================
-- RPC: get_all_condominios_for_admin
-- Global admin busca todos os condominios (bypassa RLS)
-- Outros usuários veem apenas o próprio condomínio
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_all_condominios_for_admin()
RETURNS SETOF public.condominios
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('global_admin', 'admin_global', 'master')
  ) THEN
    RETURN QUERY SELECT * FROM public.condominios ORDER BY name;
  ELSE
    RETURN QUERY
      SELECT * FROM public.condominios
      WHERE id = (
        SELECT condominio_id FROM public.profiles
        WHERE id = auth.uid() LIMIT 1
      )
      ORDER BY name;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_condominios_for_admin() TO authenticated;

NOTIFY pgrst, 'reload schema';

SELECT 'RPC criado com sucesso!' AS resultado;
