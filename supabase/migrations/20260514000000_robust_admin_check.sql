-- Fix for is_condo_admin to be more resilient for global_admin
-- and ensure they can see all condos even if memberships are missing.

CREATE OR REPLACE FUNCTION public.is_condo_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role text;
    user_email text;
BEGIN
    -- Get current user email from auth.jwt()
    user_email := auth.jwt() ->> 'email';
    
    -- Special case for master admin email
    IF user_email = 'admin@aicondo360.com' THEN
        RETURN TRUE;
    END IF;

    -- Check profile role
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    
    RETURN user_role IN (
        'admin', 'syndic', 'global_admin',
        'administrador', 'sindico', 'admin_global', 'master'
    );
END;
$$;

-- Ensure global_admin can select all from condominios
DROP POLICY IF EXISTS "condominios_select" ON public.condominios;
CREATE POLICY "condominios_select" ON public.condominios
  FOR SELECT TO authenticated
  USING (
    id = public.get_my_condo_id()
    OR public.is_condo_admin()
  );

-- Ensure global_admin can select all from tenants
DROP POLICY IF EXISTS "tenants_select" ON public.tenants;
CREATE POLICY "tenants_select" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid())
    OR public.is_condo_admin()
  );
