import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar, Clock, FileText, ChevronRight, CheckCircle2, History, 
  AlertCircle, Phone, Link as LinkIcon, Plus, X, Edit, Trash2, Save,
  Eye, EyeOff, Hourglass
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useTenant } from '../contexts/TenantContext';
import { format, isPast, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Assembleia {
  id: string;
  condominio_id: string;
  title: string;
  description: string;
  status: 'active' | 'closed';
  start_date: string;
  end_date: string;
  whatsapp_responsavel?: string;
  meeting_link?: string;
  decision?: string;
  created_at: string;
}

interface AssembleiasProps {
  condoId?: string;
  userId?: string;
}

export const Assembleias: React.FC<AssembleiasProps> = ({ condoId, userId }) => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [assembleias, setAssembleias] = useState<Assembleia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'active' | 'past'>('upcoming');

  // Modal and CRUD States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssembleia, setEditingAssembleia] = useState<Assembleia | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // View Modal States
  const [selectedAssembleia, setSelectedAssembleia] = useState<Assembleia | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [whatsappResponsavel, setWhatsappResponsavel] = useState('');
  const [decision, setDecision] = useState('');
  const [status, setStatus] = useState<'active' | 'closed'>('active');

  const isUUID = (id?: string) => {
    if (!id) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  };

  // Resolução robusta de condomínio ativo com base em props, perfil, seleção administrativa no localStorage ou contexto de tenant
  const savedAdminCondoId = localStorage.getItem('admin_selected_condo');
  const currentCondoId = condoId || 
    (user?.condoId && isUUID(user.condoId) ? user.condoId : 
    (savedAdminCondoId && isUUID(savedAdminCondoId) ? savedAdminCondoId :
    (tenant?.id && isUUID(tenant.id) ? tenant.id : '')));
  const isAdmin = user?.role === 'syndic' || user?.role === 'admin' || user?.role === 'global_admin' || user?.role === 'sindico';

  const fetchAssembleias = async () => {
    if (!currentCondoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assembleias')
        .select('*')
        .eq('condominio_id', currentCondoId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setAssembleias(data || []);
    } catch (err) {
      console.error('Error fetching assembleias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssembleias();
  }, [currentCondoId]);

  const formatForDateTimeLocal = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      return localDate.toISOString().slice(0, 16);
    } catch (e) {
      return '';
    }
  };

  const handleCreate = () => {
    setEditingAssembleia(null);
    setTitle('');
    setDescription('');
    const nowStr = new Date().toISOString().slice(0, 16);
    const twoHoursLater = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
    setStartDate(nowStr);
    setEndDate(twoHoursLater);
    setMeetingLink('');
    setWhatsappResponsavel('');
    setDecision('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleEdit = (assembleia: Assembleia) => {
    setEditingAssembleia(assembleia);
    setTitle(assembleia.title);
    setDescription(assembleia.description);
    setStartDate(formatForDateTimeLocal(assembleia.start_date));
    setEndDate(formatForDateTimeLocal(assembleia.end_date));
    setMeetingLink(assembleia.meeting_link || '');
    setWhatsappResponsavel(assembleia.whatsapp_responsavel || '');
    setDecision(assembleia.decision || '');
    setStatus(assembleia.status);
    setIsModalOpen(true);
  };

  const handleRegisterDecision = (assembleia: Assembleia) => {
    setEditingAssembleia(assembleia);
    setTitle(assembleia.title);
    setDescription(assembleia.description);
    setStartDate(formatForDateTimeLocal(assembleia.start_date));
    setEndDate(formatForDateTimeLocal(assembleia.end_date));
    setMeetingLink(assembleia.meeting_link || '');
    setWhatsappResponsavel(assembleia.whatsapp_responsavel || '');
    setDecision(assembleia.decision || '');
    setStatus('closed');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta assembleia?')) return;
    try {
      const { error } = await supabase
        .from('assembleias')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchAssembleias();
    } catch (err) {
      console.error('Error deleting assembleia:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCondoId) {
      alert("Erro: O condomínio selecionado não foi identificado. Se você for Administrador Global, por favor selecione um condomínio no menu superior.");
      return;
    }

    try {
      setIsSaving(true);
      const assembleiaData: any = {
        condominio_id: currentCondoId,
        title,
        description,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        meeting_link: meetingLink || null,
        whatsapp_responsavel: whatsappResponsavel || null,
        decision: decision || null,
        status
      };

      if (tenant?.id && isUUID(tenant.id)) {
        assembleiaData.tenant_id = tenant.id;
      }

      if (editingAssembleia) {
        const { error } = await supabase
          .from('assembleias')
          .update(assembleiaData)
          .eq('id', editingAssembleia.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('assembleias')
          .insert([assembleiaData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchAssembleias();
    } catch (err: any) {
      console.error('Erro ao salvar assembleia:', err);
      alert(`Erro ao salvar: ${err.message || 'Verifique as permissões.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewPauta = (assembleia: Assembleia) => {
    setSelectedAssembleia(assembleia);
    setIsViewModalOpen(true);
  };

  const filteredAssembleias = assembleias.filter((asc) => {
    const startDateObj = new Date(asc.start_date);
    const endDateObj = new Date(asc.end_date);
    
    if (filter === 'upcoming') {
      return isFuture(startDateObj) && asc.status !== 'closed';
    } else if (filter === 'active') {
      return isPast(startDateObj) && !isPast(endDateObj) && asc.status !== 'closed';
    } else {
      return isPast(endDateObj) || asc.status === 'closed';
    }
  });

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <FeatureHeader 
            icon={Users}
            title="Assembleias"
            description="Participe, vote e fique por dentro das decisões do seu condomínio de forma 100% digital."
            color="bg-indigo-500"
          />
        </div>
        
        {isAdmin && (
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium uppercase text-[10px] tracking-widest transition-all shadow-md active:scale-95 w-full sm:w-auto justify-center"
          >
            <Plus size={14} />
            Nova Assembleia
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'upcoming'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Próximas
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            filter === 'active'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Em Andamento
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'past'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Histórico
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredAssembleias.length > 0 ? (
            filteredAssembleias.map((assembleia, i) => (
              <motion.div
                key={assembleia.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleViewPauta(assembleia)}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${
                        filter === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        filter === 'past' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                        'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {filter === 'active' ? <Eye size={24} /> :
                         filter === 'past' ? <EyeOff size={24} /> :
                         <Hourglass size={24} />}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800 dark:text-white line-clamp-1">{assembleia.title}</h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          {format(new Date(assembleia.start_date), "dd/MM 'às' HH:mm")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {filter === 'active' && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-medium uppercase tracking-wider rounded-full">
                          Em Andamento
                        </span>
                      )}
                      {filter === 'past' && (
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-medium uppercase tracking-wider rounded-full">
                          Finalizada
                        </span>
                      )}
                      {filter === 'upcoming' && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-medium uppercase tracking-wider rounded-full">
                          Aguardando
                        </span>
                      )}
                      
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <a
                            href={`https://wa.me/${assembleia.whatsapp_responsavel ? `55${assembleia.whatsapp_responsavel.replace(/[^0-9]/g, '')}` : ''}?text=${encodeURIComponent(`📋 Assembleia: ${assembleia.title}\n📅 Data: ${format(new Date(assembleia.start_date), "dd/MM/yyyy 'às' HH:mm")}\n\n${assembleia.description}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Compartilhar no WhatsApp"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-lg text-emerald-500 transition-all"
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          </a>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(assembleia); }}
                            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(assembleia.id); }}
                            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-500 transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                    {assembleia.description}
                  </p>

                  {/* WhatsApp + Link */}
                  <div className="space-y-2 mb-4">
                    {assembleia.whatsapp_responsavel && (
                      <a
                        href={`https://wa.me/55${assembleia.whatsapp_responsavel.replace(/[^0-9]/g, '')}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone size={12} />
                        Responsável: {assembleia.whatsapp_responsavel}
                      </a>
                    )}
                    {assembleia.meeting_link && (
                      <a
                        href={assembleia.meeting_link}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LinkIcon size={12} />
                        Entrar na Reunião Online
                      </a>
                    )}
                  </div>

                  {/* Decisão Tomada */}
                  {assembleia.decision ? (
                    <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 mb-1 font-medium">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span>Decisão Decidida:</span>
                      </div>
                      <p className="italic text-slate-600 dark:text-slate-400 font-normal">{assembleia.decision}</p>
                    </div>
                  ) : (
                    filter === 'past' && isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRegisterDecision(assembleia); }}
                        className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-medium transition-all"
                      >
                        Registrar Decisão
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-medium">JD</div>
                    <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-medium">MR</div>
                    <div className="w-8 h-8 rounded-full bg-rose-200 text-rose-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-medium">AL</div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    {filter === 'active' ? 'Votar agora' : filter === 'past' ? 'Ver Ata' : 'Ver Pauta'}
                    <ChevronRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <FileText className="text-slate-300 dark:text-slate-600" size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Nenhuma assembleia encontrada</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm font-normal">
                Não há assembleias nesta categoria no momento. Quando houver, elas aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                <h3 className="text-base font-medium text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-500" />
                  {editingAssembleia ? 'Editar Assembleia' : 'Nova Assembleia'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Tema da Assembleia</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Ex: Assembleia Geral Extraordinária"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-800 dark:text-slate-100 font-normal"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Descrição / Pauta</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    placeholder="Descreva os assuntos a serem tratados nesta assembleia..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-800 dark:text-slate-100 font-normal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Data/Hora Início</label>
                    <input 
                      type="datetime-local" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-800 dark:text-slate-100 font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Data/Hora Término</label>
                    <input 
                      type="datetime-local" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-800 dark:text-slate-100 font-normal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Link da Reunião (Online)</label>
                    <input 
                      type="url" 
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://zoom.us/..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-800 dark:text-slate-100 font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">WhatsApp do Responsável</label>
                    <input 
                      type="text" 
                      value={whatsappResponsavel}
                      onChange={(e) => setWhatsappResponsavel(e.target.value)}
                      placeholder="Ex: 11999999999"
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-800 dark:text-slate-100 font-normal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Status</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-800 dark:text-slate-100 font-normal"
                    >
                      <option value="active">Agendada / Ativa</option>
                      <option value="closed">Encerrada</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Decisão Tomada (Histórico)</label>
                  <textarea 
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    rows={2}
                    placeholder="Registre o que ficou decidido nesta assembleia..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-800 dark:text-slate-100 font-normal"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium uppercase text-[11px] tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                       <>
                         <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         Salvando...
                       </>
                    ) : (
                      <>
                        <Save size={14} />
                        Salvar Assembleia
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedAssembleia && (() => {
          const startDateObj = new Date(selectedAssembleia.start_date);
          const endDateObj = new Date(selectedAssembleia.end_date);
          let viewStatus: 'active' | 'closed' | 'upcoming' = 'upcoming';
          
          if (selectedAssembleia.status === 'closed' || isPast(endDateObj)) {
            viewStatus = 'closed';
          } else if (isPast(startDateObj) && !isPast(endDateObj)) {
            viewStatus = 'active';
          }

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsViewModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-xl shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
              >
                {/* Header do Modal */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      viewStatus === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      viewStatus === 'closed' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {viewStatus === 'active' ? <Eye size={24} /> :
                       viewStatus === 'closed' ? <EyeOff size={24} /> :
                       <Hourglass size={24} />}
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-slate-900 dark:text-white line-clamp-1">
                        {selectedAssembleia.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {viewStatus === 'active' && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-medium uppercase tracking-wider rounded-full">
                            Em Andamento
                          </span>
                        )}
                        {viewStatus === 'closed' && (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-medium uppercase tracking-wider rounded-full">
                            Finalizada
                          </span>
                        )}
                        {viewStatus === 'upcoming' && (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-medium uppercase tracking-wider rounded-full">
                            Aguardando
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsViewModalOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  {/* Informações de Data/Hora */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                    <div className="flex items-start gap-2.5">
                      <Clock size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="block text-[9px] font-medium text-slate-400 uppercase tracking-wider">Início</span>
                        <span className="text-xs font-normal text-slate-700 dark:text-slate-200">
                          {format(new Date(selectedAssembleia.start_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Clock size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="block text-[9px] font-medium text-slate-400 uppercase tracking-wider">Término</span>
                        <span className="text-xs font-normal text-slate-700 dark:text-slate-200">
                          {format(new Date(selectedAssembleia.end_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Corpo da Assembleia (Pauta) */}
                  <div>
                    <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2">Pauta e Detalhes</h4>
                    <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100/50 dark:border-slate-800/50">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                        {selectedAssembleia.description}
                      </p>
                    </div>
                  </div>

                  {/* Deliberações e Decisões */}
                  {selectedAssembleia.decision && (
                    <div>
                      <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        Ata / Decisão Registrada
                      </h4>
                      <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-5 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/20">
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal italic whitespace-pre-wrap">
                          {selectedAssembleia.decision}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Links e Contatos */}
                  {(selectedAssembleia.meeting_link || selectedAssembleia.whatsapp_responsavel) && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">Ações e Contatos</h4>
                      
                      {selectedAssembleia.meeting_link && viewStatus !== 'closed' && (
                        <a
                          href={selectedAssembleia.meeting_link}
                          target="_blank" rel="noreferrer"
                          className="flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                              <LinkIcon size={16} />
                            </div>
                            <div className="text-left">
                              <span className="block text-xs font-medium text-slate-700 dark:text-slate-200">Reunião Online</span>
                              <span className="block text-[10px] font-normal text-slate-400 truncate max-w-xs">{selectedAssembleia.meeting_link}</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      )}

                      {selectedAssembleia.whatsapp_responsavel && (
                        <a
                          href={`https://wa.me/55${selectedAssembleia.whatsapp_responsavel.replace(/[^0-9]/g, '')}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-100/30 dark:border-emerald-900/20 rounded-2xl transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                              <Phone size={16} />
                            </div>
                            <div className="text-left">
                              <span className="block text-xs font-medium text-slate-700 dark:text-slate-200">Falar com Responsável</span>
                              <span className="block text-[10px] font-normal text-slate-400">{selectedAssembleia.whatsapp_responsavel}</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer do Modal */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 flex justify-end">
                  <button 
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium uppercase tracking-wider transition-colors active:scale-98"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};
