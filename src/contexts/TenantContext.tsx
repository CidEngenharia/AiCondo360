import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isGlobalAdmin = user?.role === 'global_admin';

  useEffect(() => {
    const initializeTenant = async () => {
      setLoading(true);
      
      // 1. Detect from URL
      const slug = getTenantSlugFromUrl();
      let detectedTenant = null;
      
      if (slug) {
        const tenantData = await getTenantBySlug(slug);
        if (tenantData) {
          detectedTenant = tenantData;
          setTenant(tenantData);
        }
      }

      // 2. Detect from User's primary membership (if logged in)
      if (user) {
        if (isGlobalAdmin) {
          // Global Admins can see ALL condos
          const { data: allTenants } = await supabase
            .from('condominios')
            .select('*');
          
          if (allTenants) {
            setUserTenants(allTenants);
            
            // Check for saved selection if not in URL
            const savedCondoId = localStorage.getItem('admin_selected_condo');
            const savedTenant = allTenants.find(t => t.id === savedCondoId);

            if (detectedTenant) {
              setTenant(detectedTenant);
            } else if (savedTenant) {
              setTenant(savedTenant);
            } else if (allTenants.length > 0) {
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
            
            // If no slug in URL or invalid slug, use first membership
            if (!detectedTenant) {
              setTenant(tenants[0]);
            }
          } else if (user.condoId) {
            // Fallback to user's condoId from profile if memberships table is empty
            const { data: tenantData } = await supabase
              .from('tenants')
              .select('*')
              .eq('id', user.condoId)
              .maybeSingle();
              
            if (tenantData) {
              setUserTenants([tenantData]);
              if (!detectedTenant) {
                setTenant(tenantData);
              }
            }
          }
        }
      } else {
        // 3. Fallback to default tenant for anonymous/public access or legacy support
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
    // Persist selection for next load
    localStorage.setItem('admin_selected_condo', condoId);
    // Update active tenant in state immediately
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
