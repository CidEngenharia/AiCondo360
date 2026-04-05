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
        const condo = (profile as any).condominios;
        setUser({
          id: profile.id,
          name: profile.full_name || 'Usuário',
          email: profile.email || '',
          condo: condo?.name || 'Geral',
          condoId: profile.condominio_id || condo?.id || '',
          role: profile.role as UserRole,
          plan: (condo?.plan || 'basic') as PricingPlan
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
