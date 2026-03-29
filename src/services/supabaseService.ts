import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key missing. Database features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Interfaces ---

export interface Profile {
  id: string;
  email: string;
  name: string;
  condo: string;
  condoId: string;
  role: 'resident' | 'admin' | 'syndic' | 'global_admin';
  plan: 'basic' | 'enterprise' | 'premium';
  unit: string;
  avatar_url?: string;
  whatsapp?: string;
}

export interface Boleto {
  id: string;
  user_id: string;
  condominio_id: string;
  month: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  barcode: string;
  created_at: string;
}

export interface Comunicado {
  id: string;
  condominio_id: string;
  title: string;
  content: string;
  category: 'aviso' | 'comunicado' | 'evento';
  author: string;
  created_at: string;
}

export interface MuralPost {
  id: string;
  condominio_id: string;
  author_id: string;
  author_name: string;
  author_role?: string;
  author_avatar?: string;
  content: string;
  category?: string;
  image_url?: string;
  status: 'ativo' | 'pendente' | 'finalizado';
  likes_count?: number;
  comments_count?: number;
  created_at: string;
}

export interface MuralComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export interface Reserva {
  id: string;
  condominio_id: string;
  user_id: string;
  area_name: string;
  reservation_date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
}

export interface Encomenda {
  id: string;
  condominio_id: string;
  user_id: string;
  resident_name: string;
  description: string;
  status: 'entregue' | 'pendente';
  delivery_date: string;
  photo_url?: string;
  whatsapp?: string;
  created_at: string;
}

export interface Ocorrencia {
  id: string;
  condominio_id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  created_at: string;
  updated_at: string;
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

export interface Visitante {
  id: string;
  condominio_id: string;
  user_id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  status: 'pendente' | 'autorizado' | 'finalizado';
  observation?: string;
  created_at?: string;
}

export interface Veiculo {
  id: string;
  condominio_id: string;
  user_id: string;
  brand: string;
  model: string;
  plate: string;
  color: string;
  owner_name: string;
  observation?: string;
  garage_number?: string;
  unit_number?: string;
  image_url?: string;
  type: 'car' | 'motorcycle' | 'bicycle';
  created_at?: string;
}

export interface MercadoItem {
  id: string;
  condominio_id: string;
  user_id: string;
  seller_name: string;
  seller_avatar?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'used';
  image_urls?: string[];
  image_url?: string;
  status: 'active' | 'sold';
  whatsapp?: string;
  created_at: string;
}

// --- Services ---

export const ProfileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  }
};

export const BoletoService = {
  async getUserBoletos(userId: string): Promise<Boleto[]> {
    const { data, error } = await supabase
      .from('boletos')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: false });

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
  async getRecentAnnouncements(condoId: string): Promise<Comunicado[]> {
    const { data, error } = await supabase
      .from('comunicados')
      .select('*')
      .eq('condominio_id', condoId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }

    return data as Comunicado[];
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

  async createPost(post: Omit<MuralPost, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('mural_posts')
      .insert([{
        ...post,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as MuralPost;
  },

  async updatePost(postId: string, updates: Partial<MuralPost>) {
    const { data, error } = await supabase
      .from('mural_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data as MuralPost;
  },

  async deletePost(postId: string) {
    const { error } = await supabase
      .from('mural_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },

  async likePost(postId: string, currentLikes: number): Promise<number> {
    const newLikes = currentLikes + 1;
    const { error } = await supabase
      .from('mural_posts')
      .update({ likes_count: newLikes })
      .eq('id', postId);

    if (error) throw error;
    return newLikes;
  },

  async getComments(postId: string): Promise<MuralComment[]> {
    const { data, error } = await supabase
      .from('mural_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching mural comments:', error);
      return [];
    }

    return data as MuralComment[];
  },

  async createComment(comment: Omit<MuralComment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('mural_comments')
      .insert([{
        ...comment,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as MuralComment;
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
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', userId)
      .gte('reservation_date', new Date().toISOString())
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
      .order('created_at', { ascending: false });

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
      .eq('status', 'pendente')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending packages:', error);
      return [];
    }

    return data as Encomenda[];
  },

  async getCondoPackages(condoId: string): Promise<Encomenda[]> {
    const { data, error } = await supabase
      .from('encomendas')
      .select('*')
      .eq('condominio_id', condoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching condo packages:', error);
      return [];
    }

    return data as Encomenda[];
  },

  async createPackage(pkg: Omit<Encomenda, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('encomendas')
      .insert([{
        ...pkg,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Encomenda;
  },

  async updatePackage(packageId: string, updates: Partial<Encomenda>) {
    const { data, error } = await supabase
      .from('encomendas')
      .update(updates)
      .eq('id', packageId)
      .select()
      .single();

    if (error) throw error;
    return data as Encomenda;
  },

  async deletePackage(packageId: string) {
    const { error } = await supabase
      .from('encomendas')
      .delete()
      .eq('id', packageId);

    if (error) throw error;
  }
};

export const AssembleiaService = {
  async getUpcomingAssembleia(condoId: string): Promise<Assembleia | null> {
    const { data, error } = await supabase
      .from('assembleias')
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

export const MercadoService = {
  async getCondoItems(condoId: string): Promise<MercadoItem[]> {
    const { data, error } = await supabase
      .from('mercado_items')
      .select('*')
      .eq('condominio_id', condoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mercado items:', error);
      return [];
    }

    return data as MercadoItem[];
  },

  async getRecentItems(condoId: string): Promise<MercadoItem[]> {
    const { data, error } = await supabase
      .from('mercado_items')
      .select('*')
      .eq('condominio_id', condoId)
      .limit(6)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recent items:', error);
      return [];
    }

    return data as MercadoItem[];
  },

  async createItem(item: Omit<MercadoItem, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('mercado_items')
      .insert([{
        ...item,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as MercadoItem;
  },

  async updateItem(itemId: string, updates: Partial<MercadoItem>) {
    const { data, error } = await supabase
      .from('mercado_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data as MercadoItem;
  },

  async deleteItem(itemId: string) {
    const { error } = await supabase
      .from('mercado_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }
};

export const VisitorService = {
  async getUserVisitors(userId: string): Promise<Visitante[]> {
    const { data, error } = await supabase
      .from('visitantes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching visitors:', error);
      return [];
    }

    return data as Visitante[];
  },

  async createVisitor(visitor: Omit<Visitante, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('visitantes')
      .insert([{
        ...visitor,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Visitante;
  },

  async updateVisitor(visitorId: string, updates: Partial<Visitante>) {
    const { data, error } = await supabase
      .from('visitantes')
      .update(updates)
      .eq('id', visitorId)
      .select()
      .single();

    if (error) throw error;
    return data as Visitante;
  },

  async deleteVisitor(visitorId: string) {
    const { error } = await supabase
      .from('visitantes')
      .delete()
      .eq('id', visitorId);

    if (error) throw error;
  }
};

export const VehicleService = {
  async getUserVehicles(userId: string): Promise<Veiculo[]> {
    const { data, error } = await supabase
      .from('veiculos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }

    return data as Veiculo[];
  },

  async createVehicle(vehicle: Omit<Veiculo, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('veiculos')
      .insert([{
        ...vehicle,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Veiculo;
  },

  async updateVehicle(vehicleId: string, updates: Partial<Veiculo>) {
    const { data, error } = await supabase
      .from('veiculos')
      .update(updates)
      .eq('id', vehicleId)
      .select()
      .single();

    if (error) throw error;
    return data as Veiculo;
  },

  async deleteVehicle(vehicleId: string) {
    const { error } = await supabase
      .from('veiculos')
      .delete()
      .eq('id', vehicleId);

    if (error) throw error;
  }
};
