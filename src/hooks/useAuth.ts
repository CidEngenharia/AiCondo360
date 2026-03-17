import { useEffect, useState } from 'react';
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

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          condominios (
            id,
            name,
            plan
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        const condo = (profile as any).condominios;
        setUser({
          id: profile.id,
          name: profile.full_name || 'Usuário',
          email: profile.email || '',
          condo: condo?.name || 'Geral',
          condoId: condo?.id || '',
          role: profile.role as UserRole,
          plan: (condo?.plan || 'basic') as PricingPlan
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, logout, setUser };
}
