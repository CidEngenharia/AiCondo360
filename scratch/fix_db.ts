
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  console.log("Starting database fix...");

  const condosToCreate = [
    { 
      id: '00000000-0000-0000-0000-000000000001', 
      name: 'Residencial Aurora', 
      plan: 'premium', 
      status: 'active',
      address: 'Rua das Flores, 123',
      cnpj: '12.345.678/0001-90',
      syndic_name: 'Carlos Oliveira',
      syndic_phone: '(11) 98888-7777'
    },
    { 
      id: '00000000-0000-0000-0000-000000000003', 
      name: 'Edifício Horizonte', 
      plan: 'professional', 
      status: 'active',
      address: 'Av. Brasil, 500',
      cnpj: '98.765.432/0001-10',
      syndic_name: 'Ana Silva',
      syndic_phone: '(11) 97777-6666'
    }
  ];

  for (const condo of condosToCreate) {
    console.log(`Checking/Creating condo: ${condo.name} (${condo.id})`);
    
    // Create in condominios
    const { error: condoErr } = await supabase
      .from('condominios')
      .upsert([{ 
        ...condo,
        created_at: new Date().toISOString()
      }]);
    
    if (condoErr) console.error(`Error creating condo ${condo.name}:`, condoErr.message);
    else console.log(`Condo ${condo.name} ensured in condominios table.`);

    // Create in tenants
    const { error: tenantErr } = await supabase
      .from('tenants')
      .upsert([{ 
        id: condo.id,
        name: condo.name,
        slug: condo.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (tenantErr) console.error(`Error creating tenant ${condo.name}:`, tenantErr.message);
    else console.log(`Tenant ${condo.name} ensured in tenants table.`);
  }

  console.log("Database fix completed.");
}

fixDatabase();
