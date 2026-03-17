import { supabase } from '../lib/supabase';
import { UserRole, PricingPlan } from '../constants';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  condominio_id?: string;
  unit?: string;
  avatar_url?: string;
}

export interface Boleto {
  id: string;
  condominio_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  barcode?: string;
  pdf_url?: string;
}

export interface Comunicado {
  id: string;
  condominio_id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
}

export const ProfileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as UserProfile;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    return data;
  }
};

export const CondoService = {
  async getCondoDetails(condoId: string) {
    const { data, error } = await supabase
      .from('condominios')
      .select('*')
      .eq('id', condoId)
      .single();

    if (error) {
      console.error('Error fetching condo:', error);
      return null;
    }

    return data;
  }
};

export const BoletoService = {
  async getUserBoletos(userId: string): Promise<Boleto[]> {
    const { data, error } = await supabase
      .from('boletos')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching boletos:', error);
      return [];
    }

    return data as Boleto[];
  },

  async getNextPendingBoleto(userId: string): Promise<Boleto | null> {
    const { data, error } = await supabase
      .from('boletos')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching next boleto:', error);
      return null;
    }

    return data as Boleto;
  }
};

export const AnnouncementService = {
  async getRecentAnnouncements(condoId: string, limit = 5): Promise<Comunicado[]> {
    const { data, error } = await supabase
      .from('comunicados')
      .select('*')
      .eq('condominio_id', condoId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }

    return data as Comunicado[];
  }
};
