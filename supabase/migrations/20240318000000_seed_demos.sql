-- Seed for Demo Accounts to ensure valid UUID references in core modules
INSERT INTO condominios (id, name, plan)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Administração Exclusiva', 'premium'),
  ('00000000-0000-0000-0000-000000000003', 'Condomínio Paineiras', 'basic'),
  ('00000000-0000-0000-0000-000000000004', 'Condomínio Jardim', 'enterprise'),
  ('00000000-0000-0000-0000-000000000005', 'Condomínio Miami', 'premium')
ON CONFLICT (id) DO NOTHING;

-- Ensure demo profiles exist for these IDs if needed for foreign keys (optional but recommended)
INSERT INTO profiles (id, condominio_id, role, full_name, email)
VALUES
  ('00000000-0000-0000-0000-00000000000A', '00000000-0000-0000-0000-000000000001', 'global_admin', 'Administrador Demo', 'admin@aicondo360.com'),
  ('00000000-0000-0000-0000-00000000000B', '00000000-0000-0000-0000-000000000003', 'morador', 'Morador Demonstrativo', 'morador@morador.com'),
  ('00000000-0000-0000-0000-00000000000C', '00000000-0000-0000-0000-000000000004', 'sindico', 'Síndico Demonstrativo', 'sindico@condominio.com')
ON CONFLICT (id) DO NOTHING;
