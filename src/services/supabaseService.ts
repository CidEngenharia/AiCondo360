import { supabase, createAdminClient } from '../lib/supabase';

// --- Interfaces ---

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  condominio_id: string;
  tenant_id?: string;
  role: 'resident' | 'admin' | 'syndic' | 'global_admin' | 'morador' | 'sindico' | 'administrador' | 'admin_global';
  unit: string;
  building?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Condominio {
  id: string;
  tenant_id?: string;
  name: string;
  address?: string;
  cnpj?: string;
  plan: 'basic' | 'professional' | 'premium';
  status: 'active' | 'inactive';
  syndic_name?: string;
  syndic_phone?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  late_fee_per_hour?: number;
  created_at: string;
}

export interface Boleto {
  id: string;
  user_id: string;
  condominio_id: string;
  tenant_id?: string;
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
  tenant_id?: string;
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
  tenant_id?: string;
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
  tenant_id?: string;
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
  tenant_id?: string;
  user_id: string;
  requester_name?: string;
  area_name: string;
  reservation_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  late_fee_per_hour?: number;
  total_late_fee?: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'finished';
  created_at: string;
}

export interface Encomenda {
  id: string;
  condominio_id: string;
  tenant_id?: string;
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
  tenant_id?: string;
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
  tenant_id?: string;
  title: string;
  description: string;
  status: 'active' | 'closed';
  start_date: string;
  end_date: string;
  meeting_link?: string;
  whatsapp_responsavel?: string;
  decision?: string;
  created_at: string;
}

export interface Visitante {
  id: string;
  condominio_id: string;
  tenant_id?: string;
  user_id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  status: 'pendente' | 'autorizado' | 'finalizado';
  observation?: string;
  exit_time?: string;
  document?: string;
  created_at?: string;
}

export interface Veiculo {
  id: string;
  condominio_id: string;
  tenant_id?: string;
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
    const insertData: Record<string, any> = { ...profile };

    // Profiles has a FK to auth.users(id).
    // We must create the auth user first (via signUp with a temp password),
    // then the profile will be auto-created by the handle_new_user trigger.
    // If the trigger is not set up, we upsert manually after signUp.

    const tempPassword = `Condo${(insertData.unit || '00').replace(/\D/g, '') || '360'}@${Math.floor(Math.random() * 9000) + 1000}`;
    const email = insertData.email as string;

    if (!email) {
      throw new Error('E-mail é obrigatório para criar o usuário no sistema de autenticação.');
    }

    // Step 1: Create the auth user with a temp password
    // Use a non-persisting client to avoid switching the admin's session
    const adminClient = createAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          full_name: insertData.full_name,
          role: insertData.role || 'morador',
          condominio_id: insertData.condominio_id,
          tenant_id: insertData.tenant_id,
        },
      },
    });

    if (authError) {
      // If user already exists in auth, try to just upsert the profile row
      if (authError.message?.includes('already registered') || authError.status === 422) {
        console.warn('[ProfileService] Auth user already exists, attempting profile upsert...');
        // We cannot know the UUID of an existing auth user from client side.
        // Inform caller to use the Supabase dashboard.
        throw new Error(
          `Este e-mail já está cadastrado no sistema. Para vincular um perfil existente, ` +
          `acesse o Painel do Supabase > Authentication > Users e copie o UUID do usuário.`
        );
      }
      console.error('[ProfileService] Auth signUp error:', authError.message);
      throw authError;
    }

    const authUserId = authData.user?.id;
    if (!authUserId) {
      throw new Error('Falha ao obter ID do usuário autenticado após cadastro.');
    }

    // Step 2: Upsert the profile row with the real auth user UUID
    const profileRow: Record<string, any> = {
      id: authUserId,
      full_name: insertData.full_name,
      email,
      role: insertData.role || 'morador',
      unit: insertData.unit,
      building: insertData.building,
      phone: insertData.phone,
      condominio_id: insertData.condominio_id,
      tenant_id: insertData.tenant_id,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert([profileRow], { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('[ProfileService] Profile upsert error:', error.message, error.details);
      throw error;
    }

    // Return profile + temp password so caller can show it to admin
    return { ...(data as Profile), _tempPassword: tempPassword };
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
    console.log(`[BoletoService] Fetching boletos for condo: ${condoId}`);
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
    
    // 1. Validar Role
    const profile = await ProfileService.getProfile(reserva.user_id);
    const validRoles = ['morador', 'resident', 'sindico', 'syndic', 'admin_global', 'global_admin', 'administrador'];
    
    if (!profile || !validRoles.includes(profile.role)) {
      throw new Error("morador não pode realizar reserva pois não está cadastrado no sistema");
    }

    // 2. Verificar Inadimplência (apenas para moradores)
    if (['morador', 'resident'].includes(profile.role)) {
      const hasDebt = await FinanceiroService.hasPendingFines(reserva.user_id);
      if (hasDebt) {
        throw new Error("Você possui multas pendentes e está impossibilitado de realizar novas reservas.");
      }
    }

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

  async finishReserva(reservaId: string, actualEndTime: string, actualEndDate: string) {
    // 1. Fetch the reservation
    const { data: reserva, error: fetchError } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', reservaId)
      .single();

    if (fetchError || !reserva) throw fetchError || new Error('Reserva não encontrada');

    const expectedEnd = new Date(`${reserva.end_date || reserva.reservation_date}T${reserva.end_time || '22:00:00'}`);
    const actualEnd = new Date(`${actualEndDate}T${actualEndTime}`);

    let totalLateFee = 0;
    if (actualEnd > expectedEnd) {
      // Utilitários para formatação e cálculo do período de atraso
      const formatToBrDate = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      };

      const getDaysDiff = (startStr: string, endStr: string) => {
        const d1 = new Date(startStr + 'T00:00:00');
        const d2 = new Date(endStr + 'T00:00:00');
        const diffMsLocal = d2.getTime() - d1.getTime();
        const diffDaysLocal = Math.ceil(diffMsLocal / (1000 * 60 * 60 * 24));
        return diffDaysLocal >= 0 ? diffDaysLocal + 1 : 0;
      };

      const numToWords = (n: number) => {
        const words = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
        return words[n] || n.toString();
      };

      const expectedDateFmt = formatToBrDate(reserva.end_date || reserva.reservation_date);
      const actualDateFmt = formatToBrDate(actualEndDate);
      const diffDays = getDaysDiff(reserva.end_date || reserva.reservation_date, actualEndDate);

      // Buscar valor da multa diária do condomínio (salva na coluna late_fee_per_hour)
      const { data: condo } = await supabase
        .from('condominios')
        .select('late_fee_per_hour')
        .eq('id', reserva.condominio_id)
        .single();

      const dailyFee = condo?.late_fee_per_hour || 50; 
      totalLateFee = diffDays * dailyFee;

      // Buscar nome do morador real
      let userName = reserva.requester_name || '';
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', reserva.user_id)
          .single();
        if (profile?.full_name) {
          userName = profile.full_name;
        }
      } catch (profileErr) {
        console.error('[finishReserva] Erro ao buscar nome do morador:', profileErr);
      }
      if (!userName) userName = 'Não informado';

      const daysText = diffDays === 1 ? 'um dia' : `${numToWords(diffDays)} dias`;
      const observacaoText = `Reservado por: ${userName}, de ${expectedDateFmt} a ${actualDateFmt}, - ${daysText} de atraso Total da multa R$ ${totalLateFee.toFixed(2)}`;

      // 2. Criar registro financeiro automático — em bloco separado para não bloquear finalização
      try {
        await FinanceiroService.createExpense({
          condominio_id: reserva.condominio_id,
          tenant_id: reserva.tenant_id,
          user_id: reserva.user_id,
          nome: `Multa por atraso: ${reserva.area_name}`,
          valor: totalLateFee,
          origem: 'multa_reserva',
          tipo: 'receita',
          status: 'pendente',
          categoria: 'Multas',
          observacao: observacaoText
        });
      } catch (feeErr) {
        console.error('[finishReserva] Falha ao registrar multa financeira (reserva ainda será finalizada):', feeErr);
      }
    }

    // 3. Update reservation status
    const { data, error } = await supabase
      .from('reservas')
      .update({
        status: 'finished',
        total_late_fee: totalLateFee
      })
      .eq('id', reservaId)
      .select()
      .single();

    if (error) throw error;
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
  tenant_id?: string;
  user_id?: string;
  nome: string;
  valor: number;
  origem: string;
  tipo?: 'receita' | 'despesa';
  status?: 'pendente' | 'pago' | 'cancelado';
  categoria?: string;
  observacao?: string;
  created_at: string;
  updated_at?: string;
}

// --- Services ---

export const FinanceiroService = {
  async getCondoExpenses(condoId: string): Promise<FinanceiroRecord[]> {
    console.log(`[FinanceiroService] Fetching expenses for condo: ${condoId}`);
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

  async hasPendingFines(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('financeiro')
      .select('id')
      .eq('user_id', userId)
      .eq('origem', 'multa_reserva')
      .eq('status', 'pendente')
      .limit(1);

    if (error) {
      console.error('[FinanceiroService] Error checking debts:', error);
      return false;
    }
    return data && data.length > 0;
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
    // 1ª tentativa: RPC com SECURITY DEFINER (bypassa RLS)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_all_condominios_for_admin');

    if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
      console.log('[CondominioService] Dados via RPC:', rpcData.length, 'condomínios');
      return rpcData as Condominio[];
    }

    // 2ª tentativa: query autenticada direta
    const { data, error } = await supabase
      .from('condominios')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data && data.length > 0) {
      console.log('[CondominioService] Dados via query autenticada:', data.length, 'condomínios');
      return data as Condominio[];
    }

    // 3ª tentativa: cliente anônimo (igual à tela de Login — sem token de sessão, sem bloqueio RLS)
    console.warn('[CondominioService] Usando cliente anônimo (como Login):', error?.message);
    const anonClient = createAdminClient();
    const { data: anonData, error: anonError } = await anonClient
      .from('condominios')
      .select('*')
      .order('name', { ascending: true });

    if (anonError) {
      console.error('[CondominioService] Falha total ao carregar condomínios:', anonError);
      return [];
    }

    return (anonData || []) as Condominio[];
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
    console.log("[CondominioService] Updating condo via RPC:", condoId);

    // Usa RPC SECURITY DEFINER para bypassa RLS corretamente
    const { data, error } = await supabase.rpc('admin_update_condominio', {
      p_id:              condoId,
      p_name:            updates.name            ?? null,
      p_address:         updates.address          ?? null,
      p_cnpj:            updates.cnpj             ?? null,
      p_plan:            updates.plan             ?? null,
      p_status:          updates.status           ?? null,
      p_syndic_name:     updates.syndic_name      ?? null,
      p_syndic_phone:    updates.syndic_phone     ?? null,
      p_late_fee_per_hour: updates.late_fee_per_hour ?? null,
    });

    if (error) {
      console.error("[CondominioService] RPC update error:", error.message);
      throw error;
    }
    return data as Condominio;
  },

  async deleteCondominio(condoId: string) {
    console.log("[CondominioService] Deleting condo via RPC:", condoId);

    // Usa RPC SECURITY DEFINER para bypassa RLS corretamente
    const { error } = await supabase.rpc('admin_delete_condominio', {
      p_id: condoId,
    });

    if (error) {
      console.error("[CondominioService] RPC delete error:", error.message);
      throw error;
    }
  }
};
