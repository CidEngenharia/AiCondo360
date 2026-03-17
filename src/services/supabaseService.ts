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
  month: string;
  year: number;
  type: string;
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

export interface Reserva {
  id: string;
  condominio_id: string;
  user_id: string;
  area_name: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
}

export interface Encomenda {
  id: string;
  condominio_id: string;
  user_id: string;
  description: string;
  status: 'pending' | 'delivered';
  tracking_code?: string;
  photo_url?: string;
  arrival_date: string;
}

export interface MuralPost {
  id: string;
  condominio_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  category: 'announcement' | 'lost-found' | 'neighbor';
  created_at: string;
}

export interface Assembleia {
  id: string;
  condominio_id: string;
  title: string;
  description: string;
  status: 'active' | 'closed';
  start_date: string;
  end_date: string;
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

export const ReservationService = {
  async getUserReservations(userId: string): Promise<Reserva[]> {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', userId)
      .order('reservation_date', { ascending: false });

    if (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }

    return data as Reserva[];
  },

  async getUpcomingReservations(userId: string): Promise<Reserva[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('reservation_date', today)
      .order('reservation_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming reservations:', error);
      return [];
    }

    return data as Reserva[];
  }
};

export const PackageService = {
  async getUserPackages(userId: string): Promise<Encomenda[]> {
    const { data, error } = await supabase
      .from('encomendas')
      .select('*')
      .eq('user_id', userId)
      .order('arrival_date', { ascending: false });

    if (error) {
      console.error('Error fetching packages:', error);
      return [];
    }

    return data as Encomenda[];
  },

  async getPendingPackages(userId: string): Promise<Encomenda[]> {
    const { data, error } = await supabase
      .from('encomendas')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'arrived')
      .order('arrival_date', { ascending: false });

    if (error) {
      console.error('Error fetching pending packages:', error);
      return [];
    }

    return data as Encomenda[];
  }
};

export const MuralService = {
  async getPosts(condoId: string): Promise<MuralPost[]> {
    const { data, error } = await supabase
      .from('mural_posts')
      .select('*')
      .eq('condominio_id', condoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mural posts:', error);
      return [];
    }

    return data as MuralPost[];
  },

  async createPost(post: Omit<MuralPost, 'id' | 'created_at' | 'likes_count' | 'comments_count'>) {
    const { data, error } = await supabase
      .from('mural_posts')
      .insert([
        {
          ...post,
          likes_count: 0,
          comments_count: 0,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as MuralPost;
  },

  async likePost(postId: string, currentLikes: number) {
    const { error } = await supabase
      .from('mural_posts')
      .update({ likes_count: currentLikes + 1 })
      .eq('id', postId);

    if (error) throw error;
  }
};

export const AssembleiaService = {
  async getAssembleias(condoId: string): Promise<Assembleia[]> {
    const { data, error } = await supabase
      .from('assembleia')
      .select('*')
      .eq('condominio_id', condoId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching assembleias:', error);
      return [];
    }

    return data as Assembleia[];
  },

  async getUpcomingAssembleia(condoId: string): Promise<Assembleia | null> {
    const { data, error } = await supabase
      .from('assembleia')
      .select('*')
      .eq('condominio_id', condoId)
      .eq('status', 'active')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching upcoming assembleia:', error);
      return null;
    }

    return data as Assembleia;
  }
};
