import { supabase } from '../lib/supabase';

// --- Interfaces ---

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  condominio_id: string;
  role: 'resident' | 'admin' | 'syndic' | 'global_admin' | 'morador' | 'sindico' | 'administrador' | 'admin_global';
  unit: string;
  building?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Condominio {
  id: string;
  name: string;
  address?: string;
  cnpj?: string;
  plan: 'basic' | 'professional' | 'premium';
  status: 'active' | 'inactive';
  syndic_name?: string;
  syndic_phone?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
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
  author_id?: string;
  user_id?: string;
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
  start_time?: string;
  end_time?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
}

export interface Encomenda {
  id: string;
  condominio_id: string;
  user_id: string;
  description: string;
  status: 'pending' | 'delivered' | 'returned' | 'entregue' | 'pendente' | 'devolvida';
  arrival_date: string;
  delivery_date?: string;
  tracking_code?: string;
  resident_name?: string;
  resident_whatsapp?: string;
  image_url?: string;
  photo_url?: string;
  observation?: string;
  created_at?: string;
}

export interface Ocorrencia {
  id: string;
  condominio_id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  priority?: string;
  messages?: number;
  message?: string;
  visualized_by?: string;
  views_count?: number;
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
  document?: string;
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
  seller_id?: string;
  user_id?: string;
  product_name: string;
  title?: string;
  description: string;
  price: string | number;
  category: string;
  condition: string;
  photo_url?: string;
  photo_url_2?: string;
  photo_url_3?: string;
  status: string;
  whatsapp?: string;
  contact_name?: string;
  author?: string;
  unit?: string;
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
  },

  async getCondoResidents(condoId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('condominio_id', condoId)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching condo residents:', error);
      return [];
    }
    return data as Profile[];
  },

  async createProfile(profile: Partial<Profile>) {
    const insertData = { ...profile };
    if (!insertData.id) {
      insertData.id = crypto.randomUUID();
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("[ProfileService] Create error:", error.message, error.details);
      throw error;
    }
    return data as Profile;
  },

  async deleteProfile(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
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
  },

  async getCondoBoletos(condoId: string): Promise<Boleto[]> {
    const { data, error } = await supabase
      .from('boletos')
      .select('*')
      .eq('condominio_id', condoId)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Error fetching condo boletos:', error);
      return [];
    }
    return data as Boleto[];
  },

  async createBoleto(boleto: Omit<Boleto, 'id' | 'created_at'>) {
    const insertData: any = {
      ...boleto,
      created_at: new Date().toISOString()
    };
    
    // Se não houver user_id (cadastro geral por admin), removemos para o Supabase ignorar
    if (!boleto.user_id) {
       delete insertData.user_id;
    }

    const { data, error } = await supabase
      .from('boletos')
      .insert([insertData])
      .select()
      .maybeSingle();

    if (error) {
      console.error("[BoletoService] Error creating boleto:", error.message, error.details);
      throw error;
    }
    return data as Boleto;
  },

  async updateBoleto(id: string, updates: Partial<Boleto>) {
    const { data, error } = await supabase
      .from('boletos')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
       console.error("[BoletoService] Error updating boleto:", error.message, error.details);
       throw error;
    }
    return data as Boleto;
  },

  async deleteBoleto(id: string) {
    const { error } = await supabase
      .from('boletos')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
  },

  async getAllAnnouncements(condoId: string): Promise<Comunicado[]> {
    const { data, error } = await supabase
      .from('comunicados')
      .select('*')
      .eq('condominio_id', condoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all announcements:', error);
      return [];
    }
    return data as Comunicado[];
  },

  async createAnnouncement(comunicado: any) {
    return ComunicadoService.createComunicado(comunicado);
  },

  async updateAnnouncement(id: string, updates: any) {
    return ComunicadoService.updateComunicado(id, updates);
  },

  async deleteAnnouncement(id: string) {
    return ComunicadoService.deleteAnnouncement(id);
  }
};

export const ComunicadoService = {
  async createComunicado(comunicado: any) {
    // Mapeia para as colunas reais do banco (author_id, title, content)
    const dbComunicado: any = {
      condominio_id: comunicado.condominio_id,
      title: comunicado.title,
      content: comunicado.content,
      created_at: new Date().toISOString()
    };

    // Se tivermos o ID do usuário (author_id), usamos. Caso contrário, tentamos manter o autor se a coluna existir
    if (comunicado.author_id) {
       dbComunicado.author_id = comunicado.author_id;
    }

    const { data, error } = await supabase
      .from('comunicados')
      .insert([dbComunicado])
      .select()
      .maybeSingle();

    if (error) {
      console.error("[ComunicadoService] Create error:", error.message, error.details);
      // Se o erro for de coluna inexistente (author_id), tenta o básico apenas com title/content
      if (error.message?.includes('author_id')) {
         const { author_id, ...minimalDoc } = dbComunicado;
         const { data: d2, error: e2 } = await supabase
           .from('comunicados')
           .insert([minimalDoc])
           .select()
           .maybeSingle();
         if (e2) throw e2;
         return d2 as Comunicado;
      }
      throw error;
    }
    return data as Comunicado;
  },

  async updateComunicado(id: string, updates: any) {
    const dbUpdates: any = {
      title: updates.title,
      content: updates.content
    };

    const { data, error } = await supabase
      .from('comunicados')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Comunicado;
  },

  async deleteAnnouncement(id: string) {
    const { error } = await supabase
      .from('comunicados')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
  },

  async getCondoReservations(condoId: string): Promise<Reserva[]> {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('condominio_id', condoId)
      .order('reservation_date', { ascending: true });

    if (error) {
      console.error('Error fetching condo reservations:', error);
      return [];
    }

    return data as Reserva[];
  },

  async createReserva(reserva: any) {
    console.log("[ReservaService] Attempting to create reserva for user:", reserva.user_id);
    const { data, error } = await supabase
      .from('reservas')
      .insert([{
        ...reserva,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error("[ReservaService] Error details:", error.message, error.details, error.hint);
      throw error;
    }
    return data as Reserva;
  },

  async updateReserva(reservaId: string, updates: Partial<Reserva>) {
    const { data, error } = await supabase
      .from('reservas')
      .update(updates)
      .eq('id', reservaId)
      .select()
      .single();

    if (error) throw error;
    return data as Reserva;
  },

  async deleteReserva(reservaId: string) {
    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', reservaId);

    if (error) throw error;
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
        photo_url: pkg.photo_url || pkg.image_url, 
        image_url: pkg.image_url || pkg.photo_url,
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
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent mercado items:', error);
      return [];
    }

    return data as MercadoItem[];
  },

  async createItem(item: any) {
    // Normalize price: "R$ 1.500,00" → "1500.00"
    const rawPrice = String(item.price || '0')
      .replace(/[R$\s]/g, '')   // remove R$, spaces
      .replace(/\./g, '')        // remove thousand-separators (e.g. 1.500)
      .replace(',', '.');        // replace decimal comma with dot

    const dbItem: any = {
      condominio_id: item.condominio_id,
      product_name: item.title || item.product_name || 'Sem título',
      title:        item.title || item.product_name,
      price:        rawPrice,
      category:     item.category,
      description:  item.description,
      condition:    item.condition,
      whatsapp:     item.whatsapp,
      contact_name: item.contact_name || item.author,
      photo_url:    item.photo_url || item.image_url,
      photo_url_2:  item.photo_url_2 || null,
      photo_url_3:  item.photo_url_3 || null,
      status:       item.status || 'active',
      created_at:   new Date().toISOString()
    };

    // Add author/unit only if present (columns may not exist in older schemas)
    if (item.author) dbItem.author = item.author;
    if (item.unit)   dbItem.unit   = item.unit;

    const { data, error } = await supabase
      .from('mercado_items')
      .insert([dbItem])
      .select()
      .single();

    if (error) throw error;
    return data as MercadoItem;
  },

  async updateItem(itemId: string, item: any) {
    // Normalize price: "R$ 1.500,00" → "1500.00"
    const rawPrice = String(item.price || '0')
      .replace(/[R$\s]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const dbItem: any = {
      product_name: item.title || item.product_name,
      title:        item.title || item.product_name,
      price:        rawPrice,
      category:     item.category,
      description:  item.description,
      condition:    item.condition,
      whatsapp:     item.whatsapp,
      contact_name: item.contact_name || item.author,
      photo_url:    item.photo_url || item.image_url,
      photo_url_2:  item.photo_url_2 || null,
      photo_url_3:  item.photo_url_3 || null,
      status:       item.status || 'active'
    };

    // Add author/unit only if present (columns may not exist in older schemas)
    if (item.author) dbItem.author = item.author;
    if (item.unit)   dbItem.unit   = item.unit;

    const { data, error } = await supabase
      .from('mercado_items')
      .update(dbItem)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error("[MercadoService] Update error:", error.message, error.details);
      throw error;
    }
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

  async getCondoVisitors(condoId: string): Promise<Visitante[]> {
    const { data, error } = await supabase
      .from('visitantes')
      .select('*')
      .eq('condominio_id', condoId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching condo visitors:', error);
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

  async getCondoVehicles(condoId: string): Promise<Veiculo[]> {
    const { data, error } = await supabase
      .from('veiculos')
      .select('*')
      .eq('condominio_id', condoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching condo vehicles:', error);
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

export const OcorrenciaService = {
  async getUserOcorrencias(userId: string): Promise<Ocorrencia[]> {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user ocorrencias:', error);
      return [];
    }

    return data as Ocorrencia[];
  },

  async getCondoOcorrencias(condoId: string): Promise<Ocorrencia[]> {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('condominio_id', condoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching condo ocorrencias:', error);
      return [];
    }

    return data as Ocorrencia[];
  },

  async createOcorrencia(ocorrencia: Omit<Ocorrencia, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('ocorrencias')
      .insert([{
        ...ocorrencia,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Ocorrencia;
  },

  async updateOcorrencia(id: string, updates: Partial<Ocorrencia>) {
    const { data, error } = await supabase
      .from('ocorrencias')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ocorrencia;
  },

  async deleteOcorrencia(id: string) {
    const { error } = await supabase
      .from('ocorrencias')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async incrementViews(id: string, currentViews: number = 0) {
    const { data, error } = await supabase
      .from('ocorrencias')
      .update({ views_count: currentViews + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ocorrencia;
  }
};

export const PetService = {
  async getCondoPets(condoId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('condominio_id', condoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pets:', error);
      return [];
    }
    return data;
  },

  async createPet(pet: any) {
    console.log("[PetService] Creating pet for condo:", pet.condominio_id);
    const dbPet: any = {
      condominio_id: pet.condominio_id,
      // user_id is dropped if null or profile does not exist to avoid FK violation in demo
      user_id: pet.user_id, 
      name: pet.name,
      type: pet.species || pet.type || 'Other',
      breed: pet.breed,
      photo_url: pet.photo || pet.photo_url,
      vaccination_status: pet.is_vaccinated ? 'up_to_date' : 'pending',
      weight: pet.weight,
      color: pet.color,
      address: pet.address,
      status: pet.status || 'Ativo',
      species: pet.species || pet.type || 'Other',
      owner_name: pet.owner_name,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('pets')
      .insert([dbPet])
      .select()
      .single();

    if (error) {
      console.error("[PetService] Error creating pet:", error.message, error.details);
      throw error;
    }
    return data;
  },

  async updatePet(id: string, pet: any) {
    const dbPet = {
      name: pet.name,
      type: pet.species || pet.type,
      breed: pet.breed,
      photo_url: pet.photo || pet.photo_url,
      vaccination_status: pet.is_vaccinated ? 'up_to_date' : 'pending',
      weight: pet.weight,
      color: pet.color,
      address: pet.address,
      status: pet.status || 'Ativo',
      species: pet.species || pet.type,
      owner_name: pet.owner_name
    };

    const { data, error } = await supabase
      .from('pets')
      .update(dbPet)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("[PetService] Error updating pet:", error.message, error.details);
      throw error;
    }
    return data;
  },

  async deletePet(id: string) {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export const DocumentoService = {
  async getCondoDocs(condoId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('condominio_id', condoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching docs:', error);
      return [];
    }
    return data;
  },

  async createDoc(doc: any) {
    // user_id é omitido para evitar violação de FK quando o perfil não existe
    const dbDoc: any = {
      condominio_id: doc.condominio_id,
      title: doc.title,
      category: doc.category,
      file_url: doc.file_url || 'https://placeholder.aicondo360.com/doc.pdf',
      created_at: new Date().toISOString()
    };
    // Só adiciona description e user_id se a coluna existir no banco
    if (doc.description) dbDoc.description = doc.description;

    const { data, error } = await supabase
      .from('documentos')
      .insert([dbDoc])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDoc(id: string) {
    const { error } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export interface FinanceiroRecord {
  id: string;
  condominio_id: string;
  nome: string;
  valor: number;
  origem: string;
  observacao?: string;
  created_at: string;
}

// --- Services ---

export const FinanceiroService = {
  async getCondoExpenses(condoId: string): Promise<FinanceiroRecord[]> {
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .eq('condominio_id', condoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching condo expenses:', error);
      return [];
    }
    return data as FinanceiroRecord[];
  },

  async createExpense(expense: Omit<FinanceiroRecord, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('financeiro')
      .insert([{
        ...expense,
        created_at: new Date().toISOString()
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as FinanceiroRecord;
  },

  async updateExpense(id: string, updates: Partial<FinanceiroRecord>) {
    const { data, error } = await supabase
      .from('financeiro')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as FinanceiroRecord;
  },

  async deleteExpense(id: string) {
    const { error } = await supabase
      .from('financeiro')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const CondominioService = {
  async getAllCondominios(): Promise<Condominio[]> {
    const { data, error } = await supabase
      .from('condominios')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching condominios:', error);
      return [];
    }

    return data as Condominio[];
  },

  async createCondominio(condo: Omit<Condominio, 'id' | 'created_at'>) {
    console.log("[CondominioService] Creating condo:", condo.name);
    const { data, error } = await supabase
      .from('condominios')
      .insert([{
        ...condo,
        created_at: new Date().toISOString()
      }])
      .select()
      .maybeSingle();

    if (error) {
      console.error("[CondominioService] Insert error:", error.message, error.details);
      const missingColumns = ['syndic_name', 'syndic_phone', 'address', 'cnpj', 'status'];
      if (missingColumns.some(col => error.message?.includes(col))) {
         console.warn("[CondominioService] Columns missing, retrying minimal insert...");
         const basicCondo = {
           name: condo.name,
           plan: condo.plan,
           created_at: new Date().toISOString()
         };
         const { data: data2, error: error2 } = await supabase
           .from('condominios')
           .insert([basicCondo])
           .select()
           .maybeSingle();
         if (error2) throw error2;
         return data2 as Condominio;
      }
      throw error;
    }
    return data as Condominio;
  },

  async updateCondominio(condoId: string, updates: Partial<Condominio>) {
    console.log("[CondominioService] Updating condo:", condoId);
    const { data, error } = await supabase
      .from('condominios')
      .update(updates)
      .eq('id', condoId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[CondominioService] Update error:", error.message, error.details);
       const missingColumns = ['syndic_name', 'syndic_phone', 'address', 'cnpj', 'status'];
       if (missingColumns.some(col => error.message?.includes(col))) {
          console.warn("[CondominioService] Columns missing on update, retrying basic update...");
          const { syndic_name, syndic_phone, address, cnpj, status, ...basicUpdates } = updates as any;
          const { data: data2, error: error2 } = await supabase
            .from('condominios')
            .update(basicUpdates)
            .eq('id', condoId)
            .select()
            .maybeSingle();
          if (error2) throw error2;
          return data2 as Condominio;
       }
      throw error;
    }
    return data as Condominio;
  },

  async deleteCondominio(condoId: string) {
    const { error } = await supabase
      .from('condominios')
      .delete()
      .eq('id', condoId);

    if (error) throw error;
  }
};
