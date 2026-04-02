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
  Phone
} from 'lucide-react';
import { CondominioService, Condominio } from '../services/supabaseService';

export const Condominios: React.FC = () => {
  const [condos, setCondos] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Condominio, 'id' | 'created_at'>>({
    name: '',
    address: '',
    cnpj: '',
    plan: 'basic',
    status: 'active',
    syndic_name: '',
    syndic_phone: ''
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
      syndic_phone: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (condo: Condominio) => {
    setEditingId(condo.id);
    setFormData({
      name: condo.name,
      address: condo.address || '',
      cnpj: condo.cnpj || '',
      plan: condo.plan,
      status: condo.status,
      syndic_name: condo.syndic_name || '',
      syndic_phone: condo.syndic_phone || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (editingId) {
        await CondominioService.updateCondominio(editingId, formData);
      } else {
        await CondominioService.createCondominio(formData);
      }
      setIsModalOpen(false);
      loadCondos();
    } catch (error: any) {
      console.error('[Condominios] Submission error:', error);
      const detail = error.message || error.details || 'Verifique as permissões de RLS e se as colunas syndic_name/phone existem.';
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

  const formatWhatsAppLink = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    return `https://wa.me/${clean.startsWith('55') ? clean : '55' + clean}`;
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
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

      {/* Stats Quick View - Smaller Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-24">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Clientes</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{condos.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-24 md:col-span-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Faturamento Estimado</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              condos.reduce((acc, c) => acc + (c.plan === 'premium' ? 399 : c.plan === 'enterprise' ? 250 : 199), 0)
            )}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-24">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Adesão</p>
          <p className="text-2xl font-bold text-emerald-500">{condos.length > 0 ? ((condos.filter(c => c.status === 'active').length / condos.length) * 100).toFixed(0) : 0}%</p>
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
                  onClick={() => openEditModal(condo)}
                  className="p-2 bg-slate-50 dark:bg-slate-700 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg shadow-sm transition-all active:scale-95"
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
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">{condo.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <User size={10} className="shrink-0 text-blue-500" />
                       <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold truncate">{condo.syndic_name || 'Síndico não informado'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Plano</p>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-200 capitalize">{condo.plan}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-0.5 whitespace-nowrap">Licença</p>
                    <div className="flex items-center gap-1.5">
                       <StatusDot active={condo.status === 'active'} />
                       <p className={`text-[10px] font-black uppercase ${condo.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {condo.status === 'active' ? 'Full' : 'Bloq.'}
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
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/10"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                      {editingId ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-2 block">AiCondo360 Global Service</span>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl group">
                    <X size={20} className="text-slate-400 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Condomínio</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                      placeholder="Ex: Res. Parque das Águas"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Síndico</label>
                      <div className="relative">
                         <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                         <input 
                          required
                          type="text" 
                          value={formData.syndic_name}
                          onChange={(e) => setFormData({ ...formData, syndic_name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                          placeholder="Nome"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                      <div className="relative">
                         <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                         <input 
                          type="text" 
                          value={formData.syndic_phone}
                          onChange={(e) => setFormData({ ...formData, syndic_phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                      <input 
                        type="text" 
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-medium shadow-inner"
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Licença</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className={`w-full px-5 py-3.5 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest appearance-none shadow-sm transition-colors ${formData.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} dark:bg-slate-900`}
                      >
                        <option value="active">✓ Ativa</option>
                        <option value="inactive">⚠ Bloqueada</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plano SaaS</label>
                    <div className="flex gap-2">
                       {['basic', 'enterprise', 'premium'].map((p) => (
                         <button
                           key={p}
                           type="button"
                           onClick={() => setFormData({ ...formData, plan: p as any })}
                           className={`flex-1 py-2.5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${formData.plan === p ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800'}`}
                         >
                           {p}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Localização</label>
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-medium shadow-inner"
                      placeholder="Endereço Completo"
                    />
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
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
