import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getTenantSlugFromUrl, getTenantBySlug, Tenant } from '../lib/tenant';
import { useAuth } from './AuthContext';

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  userTenants: any[];
  isGlobalAdmin: boolean;
  switchTenant: (slug: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isGlobalAdmin = user?.role === 'global_admin';

  useEffect(() => {
    const initializeTenant = async () => {
      setLoading(true);
      
      // 1. Detect from URL
      const slug = getTenantSlugFromUrl();
      
      if (slug) {
        const tenantData = await getTenantBySlug(slug);
        if (tenantData) {
          setTenant(tenantData);
          setLoading(false);
          return;
        }
      }

      // 2. Detect from User's primary membership (if logged in)
      if (user) {
        if (isGlobalAdmin) {
          // Global Admins can see ALL tenants
          const { data: allTenants } = await supabase
            .from('tenants')
            .select('*');
          
          if (allTenants) {
            setUserTenants(allTenants);
            // Default to first one or stay on current if already set via slug
            if (!slug && allTenants.length > 0) {
              setTenant(allTenants[0]);
            }
          }
        } else {
          // Standard users must have a membership
          const { data: memberships } = await supabase
            .from('memberships')
            .select('tenant_id, tenants(*)')
            .eq('user_id', user.id);

          if (memberships && memberships.length > 0) {
            const tenants = memberships.map(m => m.tenants).filter(Boolean);
            setUserTenants(tenants);
            
            // If no slug in URL, use first membership
            if (!slug) {
              setTenant(tenants[0]);
            }
          }
        }
      } else {
        // 3. Fallback to default tenant for anonymous/public access or legacy support
        // But only if no slug is provided in URL
        if (!slug) {
          const defaultTenant = await getTenantBySlug('default');
          setTenant(defaultTenant);
        }
      }

      setLoading(false);
    };

    initializeTenant();
  }, [user]);

  const switchTenant = (slug: string) => {
    // Navigate to /[slug]/dashboard or similar
    // This will trigger a re-mount and re-initialization via URL detection
    window.location.href = `/${slug}/dashboard`;
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
