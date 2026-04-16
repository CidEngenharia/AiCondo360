-- Enhanced RLS Isolation for Global Admin
-- Created: 2026-04-16

-- Update get_my_tenants function to support global_admin
CREATE OR REPLACE FUNCTION get_my_tenants()
RETURNS setof uuid AS $$
BEGIN
  -- Check if user is global_admin
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (role = 'global_admin' OR role = 'admin_global' OR role = 'master')
  ) THEN
    -- Return ALL tenants for global_admin
    RETURN QUERY SELECT id FROM tenants;
  ELSE
    -- Return only memberships for standard users
    RETURN QUERY SELECT tenant_id FROM memberships WHERE user_id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply policies to ensure they use the updated function
DO $$
DECLARE
  t TEXT;
  tables_to_isolate TEXT[] := ARRAY[
    'condominios', 'profiles', 'boletos', 'comunicados', 'reservas', 
    'encomendas', 'ocorrencias', 'documentos', 'manutencao', 'mercado', 
    'assembleia', 'pets', 'veiculos', 'achados', 'enquetes', 
    'consumo', 'visitantes', 'mural_posts', 'mural_comments', 'financeiro'
  ];
BEGIN
  FOREACH t IN ARRAY tables_to_isolate LOOP
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_policy" ON %I', t);
    EXECUTE format('CREATE POLICY "tenant_isolation_policy" ON %I FOR ALL USING (tenant_id IN (SELECT get_my_tenants()))', t);
  END LOOP;
END $$;
