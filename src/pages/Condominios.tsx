import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MapPin,
  CreditCard,
  X,
  Hash,
  Activity,
  CheckCircle2,
  AlertCircle,
  User,
  MessageCircle,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Key as KeyIcon,
  ChevronRight
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

/** Generates a system email from síndico name: "Adailton Salles" → "adailton.salles.sindico@aicondo360.com" */
const generateSyndicEmail = (name: string): string => {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // remove accents
    .replace(/[^a-z\s]/g, '')
    .trim()
    .replace(/\s+/g, '.');
  return slug ? `${slug}.sindico@aicondo360.com` : '';
};

/** Generates a system password */
const generateSyndicPassword = (name: string): string => {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
  return slug ? `senha-${slug.substring(0, 4)}2026` : '';
};
import { CondominioService, Condominio, ProfileService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';

export const Condominios: React.FC = () => {
  const [condos, setCondos] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [showModalPassword, setShowModalPassword] = useState(false);
  const togglePassword = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { user } = useAuth();
  const [showPaymentReport, setShowPaymentReport] = useState(false);

  // Simulated Stripe payment data (replace with real API when available)
  const stripePayments = [
    { id: 'pi_1', condo: 'Condomínio Verde Vale',    amount: 399,   date: new Date(Date.now() - 1 * 3600000) },
    { id: 'pi_2', condo: 'Residencial Parque Azul',  amount: 320,   date: new Date(Date.now() - 5 * 3600000) },
    { id: 'pi_3', condo: 'Ed. Solar dos Ipês',       amount: 250,   date: new Date(Date.now() - 26 * 3600000) },
    { id: 'pi_4', condo: 'Cond. Bosque Verde',       amount: 399,   date: new Date(Date.now() - 48 * 3600000) },
    { id: 'pi_5', condo: 'Res. Águas Claras',        amount: 320,   date: new Date(Date.now() - 72 * 3600000) },
  ];
  const latestPayment = stripePayments[0];
  const monthTotal = stripePayments.reduce((s, p) => s + p.amount, 0);

  const [formData, setFormData] = useState<Omit<Condominio, 'id' | 'created_at'> & { syndic_email?: string }>({
    name: '',
    address: '',
    cnpj: '',
    plan: 'basic',
    status: 'active',
    syndic_name: '',
    syndic_phone: '',
    syndic_email: ''
  });

  const loadCondos = async () => {
    try {
      const data = await CondominioService.getAllCondominios();
      setCondos(data);
    } catch (error) {
      console.error('Error loading condos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCondos();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      address: '',
      cnpj: '',
      plan: 'basic',
      status: 'active',
      syndic_name: '',
      syndic_phone: '',
      syndic_email: ''
    });
    setShowModalPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (condo: Condominio) => {
    setEditingId(condo.id);
    const email = (condo as any).syndic_email || generateSyndicEmail(condo.syndic_name || '');
    setFormData({
      name: condo.name,
      address: condo.address || '',
      cnpj: condo.cnpj || '',
      plan: condo.plan,
      status: condo.status,
      syndic_name: condo.syndic_name || '',
      syndic_phone: condo.syndic_phone || '',
      syndic_email: email
    });
    setShowModalPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const { syndic_email, ...dbPayload } = formData;
      
      if (editingId) {
        await CondominioService.updateCondominio(editingId, dbPayload);
      } else {
        const novoCondo = await CondominioService.createCondominio(dbPayload);
        
        if (formData.syndic_name && novoCondo) {
          const generatedEmail = formData.syndic_email || generateSyndicEmail(formData.syndic_name);
          const generatedPassword = generateSyndicPassword(formData.syndic_name);
          
          if (generatedEmail && generatedPassword) {
            console.log("[Condominios] Criando auth para:", generatedEmail);

            const { data: authData, error: authError } = await supabase.auth.signUp({
              email: generatedEmail,
              password: generatedPassword,
              options: {
                data: {
                  full_name: formData.syndic_name,
                  role: 'syndic',
                  condominio_id: novoCondo.id
                }
              }
            });
            
            if (authError) {
              console.error("[Auth] Erro ao criar login:", authError);
              // If user already exists, try to proceed gracefully
              if (authError.message?.includes('already registered')) {
                alert(`⚠️ Este e-mail já possui conta no sistema.\nE-mail: ${generatedEmail}`);
              } else {
                alert(`Erro ao criar conta de acesso: ${authError.message}`);
              }
            } else if (authData?.user) {
              const userId = authData.user.id;

              // CRITICAL: Insert profile row so AuthContext.fetchProfile() works on login
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                  id: userId,
                  email: generatedEmail,
                  full_name: formData.syndic_name,
                  role: 'syndic',
                  condominio_id: novoCondo.id,
                  unit: 'sindico',
                }, { onConflict: 'id' });

              if (profileError) {
                console.error("[Condominios] Erro ao criar perfil:", profileError);
                alert(`Conta criada, mas houve erro ao salvar o perfil: ${profileError.message}\nO síndico pode precisar de ajuste manual na tabela profiles.`);
              } else {
                console.log("[Condominios] Perfil do síndico criado com sucesso:", userId);
                const isUnconfirmed = authData.user.identities?.length === 0;
                if (isUnconfirmed) {
                  alert(`⚠️ Conta criada, mas o e-mail precisa ser confirmado.\n\nNo painel do Supabase, desative "Confirm email" em Authentication > Settings, ou confirme o usuário manualmente.\n\nE-mail: ${generatedEmail}\nSenha: ${generatedPassword}`);
                } else {
                  alert(`✅ Síndico cadastrado com sucesso!\n\nE-mail de Acesso: ${generatedEmail}\nSenha: ${generatedPassword}\n\nGuarde essas credenciais com segurança.`);
                }
              }
            }
          }
        }
      }
      setIsModalOpen(false);
      loadCondos();
    } catch (error: any) {
      console.error('[Condominios] Submission error:', error);
      const detail = error.message || error.details || 'Verifique as permissões de RLS.';
      alert(`Erro ao processar: ${detail}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este condomínio?')) {
      setIsDeleting(id);
      try {
        await CondominioService.deleteCondominio(id);
        loadCondos();
      } catch (error) {
        alert('Erro ao excluir condomínio.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const filteredCondos = condos.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.syndic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cnpj?.includes(searchTerm)
  );

  const StatusDot = ({ active }: { active: boolean }) => (
    <div className="relative flex items-center justify-center">
      <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'} relative z-10`} />
      <motion.div 
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute w-full h-full rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`}
      />
    </div>
  );

  const counts = {
    basic: condos.filter(c => c.plan === 'basic').length,
    professional: condos.filter(c => c.plan === 'professional').length,
    premium: condos.filter(c => c.plan === 'premium').length,
    active: condos.filter(c => c.status === 'active').length
  };

  const totalRevenue = condos.reduce((acc, c) => 
    acc + (c.plan === 'premium' ? 399 : c.plan === 'professional' ? 320 : 250), 0
  );

  const formatWhatsAppLink = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    return `https://wa.me/${clean.startsWith('55') ? clean : '55' + clean}`;
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">

      {/* Stripe Payment Notification Banner (Global Admin Only) */}
      {user?.role === 'global_admin' && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl px-5 py-3.5 shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
            <CreditCard size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Stripe · Pagamento Recebido</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{latestPayment.condo}</p>
            <p className="text-[10px] text-slate-400">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(latestPayment.amount)}
              {' · '}{latestPayment.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={() => setShowPaymentReport(true)}
            className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 border border-emerald-200 bg-white dark:bg-emerald-900/20 dark:border-emerald-700 rounded-xl px-3 py-1.5 transition-all hover:shadow-sm"
          >
            Relatório <ChevronRight size={12} />
          </button>
        </motion.div>
      )}

      {/* Monthly Payment Report Popup */}
      <AnimatePresence>
      {showPaymentReport && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentReport(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Stripe · Relatório</p>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    Pagamentos — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                <button onClick={() => setShowPaymentReport(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stripePayments.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <CreditCard size={13} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-white truncate">{p.condo}</p>
                      <p className="text-[9px] text-slate-400">{p.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 shrink-0">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total do mês</span>
                <span className="text-base font-bold text-emerald-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthTotal)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Header Section - Compact */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Building2 className="text-blue-600" size={24} />
            Condomínios
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Painel Global</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus size={18} />
          Novo Registro
        </button>
      </header>

      {/* Stats Quick View - Manager Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-20">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Clientes</p>
          <div className="flex items-baseline gap-1">
             <p className="text-xl font-black text-slate-800 dark:text-white">{condos.length}</p>
             <span className="text-[10px] text-emerald-500 font-bold">Ativos: {counts.active}</span>
          </div>
        </div>

        <div className="bg-slate-50/50 dark:bg-blue-500/5 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-500/20 shadow-sm flex flex-col justify-between h-20">
          <p className="text-[8px] font-black text-blue-400/80 uppercase tracking-widest leading-none">Planos Basic</p>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400">{counts.basic}</p>
        </div>

        <div className="bg-slate-50/50 dark:bg-indigo-500/5 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20 shadow-sm flex flex-col justify-between h-20">
          <p className="text-[8px] font-black text-indigo-400/80 uppercase tracking-widest leading-none">Profissional</p>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{counts.professional}</p>
        </div>

        <div className="bg-slate-50/50 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 shadow-sm flex flex-col justify-between h-20">
          <p className="text-[8px] font-black text-emerald-400/80 uppercase tracking-widest leading-none">Planos Premium</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{counts.premium}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-20 col-span-2 md:col-span-1">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Faturamento Mensal</p>
          <p className="text-lg font-black text-slate-800 dark:text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
          </p>
        </div>
      </div>

      {/* List Section - Smaller Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />
          ))
        ) : filteredCondos.length > 0 ? (
          filteredCondos.map((condo) => (
            <motion.div 
              layout
              key={condo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                   onClick={() => {
                     localStorage.setItem('admin_selected_condo', condo.id);
                     window.location.href = '/';
                   }}
                   className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg shadow-sm transition-all active:scale-95"
                   title="Gerenciar este Condomínio"
                  >
                    <Eye size={12} />
                  </button>
                  <button 
                   onClick={() => openEditModal(condo)}
                   className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-600 hover:bg-slate-600 hover:text-white rounded-lg shadow-sm transition-all active:scale-95"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                   disabled={isDeleting === condo.id}
                   onClick={() => handleDelete(condo.id)}
                   className="p-2 bg-slate-50 dark:bg-slate-700 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg shadow-sm transition-all active:scale-95"
                  >
                    <Trash2 size={12} />
                  </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 pr-8">
                  <div className={`p-2.5 rounded-xl ${condo.plan === 'premium' ? 'bg-purple-100 text-purple-600' : condo.plan === 'enterprise' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'} dark:bg-slate-700 shrink-0`}>
                    <Building2 size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">Condomínio: {condo.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <User size={10} className="shrink-0 text-blue-500" />
                       <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium truncate">Síndico: {condo.syndic_name || 'Não informado'}</span>
                    </div>
                    {(condo.syndic_name) && (
                      <div className="flex flex-col gap-1 mt-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Mail size={10} className="shrink-0 text-slate-400" />
                          <span className="text-[10px] text-slate-500 font-medium truncate">{generateSyndicEmail(condo.syndic_name)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <KeyIcon size={10} className="shrink-0 text-slate-400" />
                          <span className="text-[10px] text-slate-500 font-medium">
                            {visiblePasswords[condo.id] ? generateSyndicPassword(condo.syndic_name) : '••••••••'}
                          </span>
                          <button 
                            type="button"
                            onClick={(e) => togglePassword(condo.id, e)}
                            className="ml-auto p-1 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Ver senha"
                          >
                            {visiblePasswords[condo.id] ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Plano</p>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-200 capitalize">
                      {condo.plan === 'professional' ? 'Profissional' : condo.plan}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-0.5 whitespace-nowrap">Situação</p>
                    <div className="flex items-center gap-1.5">
                       <StatusDot active={condo.status === 'active'} />
                       <p className={`text-[9px] font-black uppercase truncate ${condo.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {condo.status === 'active' ? 'Pgtº em dia' : 'Pgtº Pendente'}
                       </p>
                    </div>
                  </div>
                </div>

                {/* Footer Info & WhatsApp */}
                <div className="pt-3 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                   <div className="flex flex-col gap-1 overflow-hidden">
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                         <MapPin size={8} /> <span className="truncate max-w-[80px]">{condo.address || 'Sem end.'}</span>
                      </div>
                      <span className="text-[8px] text-slate-300 font-bold uppercase">
                         Ativado {new Date(condo.created_at).toLocaleDateString('pt-BR')}
                      </span>
                   </div>
                   
                   {condo.syndic_phone && (
                     <motion.a
                       whileHover={{ scale: 1.1 }}
                       whileTap={{ scale: 0.9 }}
                       href={formatWhatsAppLink(condo.syndic_phone)}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center shrink-0"
                       title="WhatsApp do Síndico"
                     >
                       <MessageCircle size={16} fill="currentColor" fillOpacity={0.2} />
                     </motion.a>
                   )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
             <Building2 size={48} className="text-slate-200 mx-auto" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sem Dados</p>
          </div>
        )}
      </section>

      {/* Modern Search */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2 pl-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-2 max-w-xs transition-all hover:ring-2 hover:ring-blue-500/20">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-32 bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0"
          />
        </div>
      </div>

      {/* Compact Upsert Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative border border-white/10"
            >
              <div className="p-4 md:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white leading-none">
                      {editingId ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1 block">AiCondo360 Global Service</span>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl group">
                    <X size={20} className="text-slate-400 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Condomínio</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                      placeholder="Ex: Res. Parque das Águas"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Síndico</label>
                      <div className="relative">
                         <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                         <input 
                          required
                          type="text" 
                          value={formData.syndic_name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setFormData({ ...formData, syndic_name: name, syndic_email: generateSyndicEmail(name) });
                          }}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                          placeholder="Nome"
                        />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                      <div className="relative">
                         <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                         <input 
                          type="text" 
                          value={formData.syndic_phone}
                          onChange={(e) => setFormData({ ...formData, syndic_phone: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Generated email & password - read only */}
                  {formData.syndic_email && (
                    <div className="space-y-1.5">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                          <Mail size={10} /> E-mail Gerado
                        </label>
                        <div className="w-full px-3 py-1.5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                          <Mail size={12} className="shrink-0" />
                          <span className="truncate">{formData.syndic_email}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <KeyIcon size={10} /> Senha 
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setShowModalPassword(!showModalPassword)}
                            className="text-slate-400 hover:text-blue-500 flex items-center gap-1 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm"
                          >
                            {showModalPassword ? <EyeOff size={9} /> : <Eye size={9} />}
                            <span className="text-[7px] font-bold uppercase tracking-wider">{showModalPassword ? 'Ocultar' : 'Exibir'}</span>
                          </button>
                        </label>
                        <div className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/30 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <KeyIcon size={12} className="shrink-0" />
                          {showModalPassword ? generateSyndicPassword(formData.syndic_name) : '••••••••'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                      <input 
                        type="text" 
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-medium shadow-inner"
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Licença</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className={`w-full px-3 py-2 border-none rounded-lg text-[10px] font-black uppercase tracking-widest appearance-none shadow-sm transition-colors ${formData.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} dark:bg-slate-900`}
                      >
                        <option value="active">✓ Ativa</option>
                        <option value="inactive">⚠ Bloq.</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Plano SaaS</label>
                    <div className="flex gap-1.5">
                       {['basic', 'professional', 'premium'].map((p) => (
                         <button
                           key={p}
                           type="button"
                           onClick={() => setFormData({ ...formData, plan: p as any })}
                           className={`flex-1 py-1.5 rounded-lg border-2 text-[9px] font-black uppercase tracking-widest transition-all ${formData.plan === p ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800'}`}
                         >
                           {p === 'professional' ? 'Profiss.' : p}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Localização</label>
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-medium shadow-inner"
                      placeholder="Endereço Completo"
                    />
                  </div>

                  <div className="pt-1 flex gap-4">
                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isProcessing ? 'Sincronizando...' : editingId ? 'Salvar Alterações' : 'Confirmar Registro'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
