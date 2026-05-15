import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getTenantSlugFromUrl, getTenantBySlug, Tenant } from '../lib/tenant';
import { useAuth } from './AuthContext';

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  userTenants: any[];
  isGlobalAdmin: boolean;
  switchTenant: (condoId: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isGlobalAdmin = user?.role === 'global_admin';

  useEffect(() => {
    const initializeTenant = async () => {
      setLoading(true);

      // ── GLOBAL ADMIN ─────────────────────────────────────────
      // Ignora o slug da URL e carrega TODOS os condomínios
      if (isGlobalAdmin) {
        let allCondos: any[] = [];

        // 1ª tentativa: RPC com SECURITY DEFINER (bypassa RLS)
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_all_condominios_for_admin');

        if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
          allCondos = rpcData;
          console.log('[TenantContext] Global admin via RPC:', allCondos.length);
        } else {
          // 2ª tentativa: query autenticada
          const { data: authData, error: authError } = await supabase
            .from('condominios')
            .select('id, name, plan, address, status')
            .order('name', { ascending: true });

          if (!authError && authData && authData.length > 0) {
            allCondos = authData;
            console.log('[TenantContext] Global admin via query auth:', allCondos.length);
          } else {
            // 3ª tentativa: cliente anônimo (mesmo que a tela de Login usa)
            console.warn('[TenantContext] Usando cliente anônimo:', authError?.message);
            const { createAdminClient } = await import('../lib/supabase');
            const anonClient = createAdminClient();
            const { data: anonData } = await anonClient
              .from('condominios')
              .select('id, name, plan, address, status')
              .order('name', { ascending: true });
            allCondos = anonData || [];
            console.log('[TenantContext] Global admin via anon:', allCondos.length);
          }
        }

        if (allCondos.length > 0) {
          setUserTenants(allCondos);
          const savedId = localStorage.getItem('admin_selected_condo');
          const saved = allCondos.find((c: any) => c.id === savedId);
          setTenant(saved ?? allCondos[0]);
        }

        setLoading(false);
        return;
      }


      // ── USUÁRIOS NORMAIS ──────────────────────────────────────
      // Detecta tenant pelo slug da URL
      const slug = getTenantSlugFromUrl();
      let detectedTenant: Tenant | null = null;

      if (slug) {
        const tenantData = await getTenantBySlug(slug);
        if (tenantData) {
          detectedTenant = tenantData;
          setTenant(tenantData);
        }
      }

      if (user) {
        // Busca via memberships
        const { data: memberships } = await supabase
          .from('memberships')
          .select('tenant_id, tenants(*)')
          .eq('user_id', user.id);

        if (memberships && memberships.length > 0) {
          const tenants = memberships.map((m: any) => m.tenants).filter(Boolean);
          setUserTenants(tenants);
          if (!detectedTenant && tenants.length > 0) {
            setTenant(tenants[0]);
          }
        } else if (user.condoId) {
          // Fallback: busca pelo condoId do perfil
          const { data: condoData } = await supabase
            .from('condominios')
            .select('id, name, plan')
            .eq('id', user.condoId)
            .maybeSingle();

          if (condoData) {
            const t = { id: condoData.id, name: condoData.name, slug: condoData.id, plan: condoData.plan };
            setUserTenants([t]);
            if (!detectedTenant) setTenant(t);
          }
        }
      } else {
        // Anônimo: usa tenant default
        if (!detectedTenant) {
          const defaultTenant = await getTenantBySlug('default');
          setTenant(defaultTenant);
        }
      }

      setLoading(false);
    };

    initializeTenant();
  }, [user, location.pathname]);

  const switchTenant = (condoId: string) => {
    localStorage.setItem('admin_selected_condo', condoId);
    const found = userTenants.find(t => t.id === condoId || t.slug === condoId);
    if (found) {
      setTenant(found);
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, loading, userTenants, isGlobalAdmin, switchTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
