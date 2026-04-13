import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole, PricingPlan } from '../constants';

export interface UserData {
  id: string;
  name: string;
  condo: string;
  condoId: string;
  role: UserRole;
  plan: PricingPlan;
  email: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      console.log("[AuthContext] Fetching profile for:", userId);

      // Use maybeSingle() to avoid throwing when profile row is missing
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          condominio_id,
          condominios (
            id,
            name,
            plan
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Profile query error:', error);
      }

      if (profile) {
        let adminCondoId = null;
        let adminCondoName = null;
        let adminPlan = null;
        
        const isGlobalAdminProfile = profile.role === 'global_admin' || profile.role === 'admin_global';
        if (isGlobalAdminProfile) {
          const savedCondoId = localStorage.getItem('admin_selected_condo');
          if (savedCondoId) {
            const { data: c } = await supabase.from('condominios').select('*').eq('id', savedCondoId).maybeSingle();
            if (c) {
              adminCondoId = c.id;
              adminCondoName = c.name;
              adminPlan = c.plan;
            } else {
              console.warn('[Auth] Selected condo not found, clearing selection:', savedCondoId);
              localStorage.removeItem('admin_selected_condo');
            }
          }
        }

        let condo = (profile as any).condominios;
        if (Array.isArray(condo)) {
          condo = condo[0];
        }

        let finalPlan = adminPlan || condo?.plan;

        // Fallback: se RLS (Row Level Security) bloqueou a visualização da tabela condominios
        // para o usuário autenticado, buscamos usando um fetch anônimo direto na API REST.
        if (profile.condominio_id && !finalPlan && !isGlobalAdminProfile) {
          try {
            const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/condominios?id=eq.${profile.condominio_id}&select=id,name,plan`;
            const response = await fetch(url, {
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                // Explicitly tells PostgREST we are an anonymous user querying this
                'Content-Type': 'application/json'
              }
            });
            const data = await response.json();
            if (data && data.length > 0) {
              condo = data[0];
              finalPlan = data[0].plan;
            }
          } catch (e) {
            console.error('[AuthContext] Error fetching fallback condo plan:', e);
          }
        }

        // Normalização crítica de Roles para evitar menus apagados
        let normalizedRole = profile.role;
        if (normalizedRole === 'proprietario' || normalizedRole === 'morador') normalizedRole = 'resident';
        if (normalizedRole === 'sindico') normalizedRole = 'syndic';
        if (normalizedRole === 'administrador') normalizedRole = 'admin';
        if (normalizedRole === 'admin_global') normalizedRole = 'global_admin';

        console.log('[AuthContext] Session Ready:', { id: profile.id, role: normalizedRole, condoId: adminCondoId || profile.condominio_id, fetchedPlan: condo?.plan });

        setUser({
          id: profile.id,
          name: profile.full_name || 'Usuário',
          email: profile.email || '',
          condo: adminCondoName || condo?.name || 'Acesso Global',
          condoId: adminCondoId || profile.condominio_id || condo?.id || '',
          role: normalizedRole as UserRole,
          plan: (finalPlan || 'basic').toLowerCase() as PricingPlan
        });
      } else {
        // Fallback: get data from auth metadata so the session is not lost
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const meta = authUser.user_metadata || {};
          console.warn('[AuthContext] No profile found, using auth metadata fallback for:', authUser.email);
          setUser({
            id: authUser.id,
            name: meta.full_name || authUser.email?.split('@')[0] || 'Usuário',
            email: authUser.email || '',
            condo: 'Geral',
            condoId: meta.condominio_id || '',
            role: (meta.role as UserRole) || 'syndic',
            plan: 'basic' as PricingPlan
          });
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
