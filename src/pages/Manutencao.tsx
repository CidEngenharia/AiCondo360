import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wrench, Search, Calendar, Clock, CheckCircle2, Shield, Trash2, Plus, X, Edit2, Briefcase, FileText, Download, Eye, Upload } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { VisitorService, Visitante as IVisitante } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';
import { useTenant } from '../contexts/TenantContext';

interface ManutencaoProps {
  userId: string;
  condoId: string;
  userRole?: string;
}

// Helper to compress image
const compressImage = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      } else {
        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const Manutencao: React.FC<ManutencaoProps> = ({ userId, condoId, userRole }) => {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const [services, setServices] = useState<IVisitante[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expected' | 'historic'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const canManage = userRole === 'admin' || userRole === 'syndic' || userRole === 'global_admin';
  const [showReportModal, setShowReportModal] = useState<{show: boolean, days: number}>({show: false, days: 0});
  const [viewingService, setViewingService] = useState<IVisitante | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<IVisitante | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Prestador de Serviço',
    date: '',
    time: '',
    status: 'autorizado' as 'pendente' | 'autorizado' | 'finalizado',
    observation: '',
    authorizedBy: '',
    photo_url: '',
    doc_type: 'RG',
    doc_number: ''
  });

  useEffect(() => {
    fetchServices();
  }, [userId]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = canManage
        ? await VisitorService.getCondoVisitors(condoId)
        : await VisitorService.getUserVisitors(userId);

      const maintenanceData = data.filter(v => v.type === 'Prestador de Serviço');
      setServices(maintenanceData.length > 0 ? maintenanceData : []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string);
      setFormData(prev => ({ ...prev, photo_url: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenModal = (service?: IVisitante) => {
    if (service) {
      setEditingService(service);
      let obs = service.observation || '';
      let authBy = '';
      if (obs.includes(' || Autorizado por: ')) {
        const parts = obs.split(' || Autorizado por: ');
        obs = parts[0];
        authBy = parts[1] || '';
      }
      const docParts = service.document?.split(':') || [];
      setFormData({
        name: service.name,
        type: service.type,
        date: service.date,
        time: service.time,
        status: service.status,
        observation: obs,
        authorizedBy: authBy,
        photo_url: service.photo_url || '',
        doc_type: docParts[0] || 'RG',
        doc_number: docParts[1] || ''
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        type: 'Prestador de Serviço',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'autorizado',
        observation: '',
        authorizedBy: '',
        photo_url: '',
        doc_type: 'RG',
        doc_number: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalCondoId = condoId || user?.condoId;
      if (!finalCondoId || finalCondoId.trim() === '') {
        alert("⚠️ Sem condomínio selecionado!\n\nSe você for Administrador Global, selecione um condomínio no menu superior antes de registrar um prestador.");
        return;
      }

      const finalObservation = formData.authorizedBy
        ? `${formData.observation}${formData.observation ? ' || ' : ''}Autorizado por: ${formData.authorizedBy}`
        : formData.observation;

      const documentStr = formData.doc_number ? `${formData.doc_type}:${formData.doc_number}` : undefined;

      const submitData: any = {
        name: formData.name,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        status: formData.status,
        observation: finalObservation,
        photo_url: formData.photo_url || undefined,
        document: documentStr
      };

      if (editingService) {
        await VisitorService.updateVisitor(editingService.id, submitData);
      } else {
        await VisitorService.createVisitor({
          ...submitData,
          user_id: userId,
          condominio_id: finalCondoId,
          tenant_id: tenant?.id
        });
      }
      setShowModal(false);
      fetchServices();
    } catch (error: any) {
      console.error('Error saving service:', error);
      alert('Erro ao salvar: ' + (error?.message || 'Erro desconhecido.'));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja excluir este registro de manutenção?')) {
      try {
        await VisitorService.deleteVisitor(id);
        fetchServices();
      } catch (error: any) {
        console.error('Error deleting service:', error);
        alert('Erro ao excluir: ' + (error?.message || 'Erro desconhecido.'));
      }
    }
  };

  const updateStatus = async (id: string, status: 'pendente' | 'autorizado' | 'finalizado') => {
    try {
      const updates: Partial<IVisitante> = { status };
      if (status === 'finalizado') {
        updates.exit_time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
      await VisitorService.updateVisitor(id, updates);
      fetchServices();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar: ' + (error?.message || 'Erro desconhecido.'));
    }
  };

  const filteredServices = services.filter(service => {
    const matchesFilter = filter === 'all' ||
                         (filter === 'expected' && (service.status === 'pendente' || service.status === 'autorizado')) ||
                         (filter === 'historic' && service.status === 'finalizado');
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (service.observation || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getReportData = (days: number) => {
    const cutOff = new Date();
    cutOff.setDate(cutOff.getDate() - days);
    return services.filter(v => {
      const d = new Date(v.date || v.created_at || '');
      return d >= cutOff;
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <FeatureHeader
        icon={Wrench}
        title="Manutenção e Prestadores"
        description="Controle os acessos de prestadores de serviço e equipes de manutenção ao condomínio."
        color="bg-amber-600"
      />

      {/* Botões de Relatório */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setShowReportModal({show: true, days: 7})}
          className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-amber-600 flex items-center gap-1 transition-colors px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full"
        >
          <FileText size={12} /> Relatório 7 Dias
        </button>
        <button
          onClick={() => setShowReportModal({show: true, days: 15})}
          className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-amber-600 flex items-center gap-1 transition-colors px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full"
        >
          <FileText size={12} /> Relatório 15 Dias
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar prestador ou serviço..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('expected')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'expected' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Ativos
            </button>
            <button
              onClick={() => setFilter('historic')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'historic' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Histórico
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-2xl font-semibold transition-all shadow-lg shadow-amber-500/20 hover:scale-105"
          >
            <Plus size={20} />
            <span className="hidden lg:inline">Novo Prestador</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(id => (
            <div key={id} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] h-64 animate-pulse border border-slate-100 dark:border-slate-700"></div>
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-4 rounded-3xl shadow-sm ${
                    service.status === 'autorizado' ? 'bg-amber-500 text-white' :
                    service.status === 'pendente' ? 'bg-rose-500 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {service.photo_url ? (
                      <img src={service.photo_url} alt={service.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <Briefcase size={20} />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      service.status === 'autorizado' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                      service.status === 'pendente' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' :
                      'bg-slate-600 text-white shadow-lg shadow-slate-500/30'
                    }`}>
                      {service.status}
                    </div>

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Prestador de serviço autorizado: ${service.name} — Data: ${service.date} às ${service.time}${service.observation ? ' — ' + service.observation.split(' || ')[0] : ''}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Compartilhar no WhatsApp"
                      className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center transition-all active:scale-95"
                      onClick={e => e.stopPropagation()}
                    >
                      <WhatsAppIcon />
                    </a>

                    {/* Visualizar */}
                    <button
                      onClick={() => setViewingService(service)}
                      title="Visualizar"
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-slate-400 hover:text-amber-600 flex items-center justify-center transition-all active:scale-95"
                    >
                      <Eye size={14} />
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => handleOpenModal(service)}
                      title="Editar"
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all active:scale-95"
                    >
                      <Edit2 size={14} />
                    </button>

                    {/* Excluir */}
                    <button
                      onClick={() => handleDelete(service.id)}
                      title="Excluir"
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all active:scale-95"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                    {service.name}
                  </h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-amber-600 font-semibold text-xs uppercase tracking-tight italic opacity-80">{service.type}</span>
                    {service.document && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Doc: {service.document.replace(':', ' ')}
                      </span>
                    )}
                    {service.observation && (
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 mt-1">
                        <p className="italic text-[11px] text-slate-500 leading-relaxed font-normal">
                          "{service.observation.split(' || Autorizado por: ')[0]}"
                        </p>
                      </div>
                    )}
                    {service.observation?.includes('Autorizado por: ') && (
                      <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-full border border-amber-100 dark:border-amber-500/20 w-fit">
                        <Shield size={10} className="text-amber-500" />
                        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                          Autorizado por: <span className="font-bold">{service.observation.split(' || Autorizado por: ')[1]}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center mb-2">
                      <span className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Calendar size={8} /> Data
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{service.date}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center mb-2">
                      <span className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Clock size={8} /> Horário
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{service.time}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between gap-3">
                  {service.status !== 'finalizado' && (
                    <button
                      onClick={() => updateStatus(service.id, 'finalizado')}
                      className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white text-slate-600 dark:text-slate-300 px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <CheckCircle2 size={14} /> Finalizar
                    </button>
                  )}
                  {service.status === 'pendente' && (
                    <button
                      onClick={() => updateStatus(service.id, 'autorizado')}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 mt-2"
                    >
                      <Shield size={14} /> Liberar Entrada
                    </button>
                  )}
                  {service.status === 'finalizado' && (
                    <div className="flex flex-col items-center gap-1 mx-auto py-2">
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        Serviço Concluído
                      </div>
                      {service.exit_time && (
                        <span className="text-[9px] font-bold text-slate-400 opacity-70">
                          Finalizado às {service.exit_time}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="bg-slate-50 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wrench size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Nenhum prestador encontrado</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Não há prestadores de serviço {filter === 'expected' ? 'ativos' : filter === 'historic' ? 'no histórico' : ''} no momento.
          </p>
        </div>
      )}

      {/* Modal Novo Prestador / Edição */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-800 rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col border border-white/10"
            >
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 z-10">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {editingService ? 'Editar Prestador' : 'Novo Prestador'}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-70">Dados do prestador de serviço</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Foto do Prestador */}
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Foto do Prestador</label>
                  <div className="relative group h-28 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-all">
                    {formData.photo_url ? (
                      <>
                        <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => document.getElementById('service-photo-input')?.click()}
                            className="p-2.5 bg-white rounded-full text-zinc-900 shadow-xl transition-all hover:scale-110"
                          >
                            <Upload size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, photo_url: '' })}
                            className="p-2.5 bg-rose-500 rounded-full text-white shadow-xl transition-all hover:scale-110"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById('service-photo-input')?.click()}
                        className="w-full h-full flex flex-col items-center justify-center gap-1"
                      >
                        <Upload size={20} className="text-amber-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Adicionar Foto</span>
                      </button>
                    )}
                  </div>
                  <input id="service-photo-input" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Nome Completo</label>
                  <input
                    required
                    maxLength={50}
                    placeholder="Nome do prestador..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3.5 py-2 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium placeholder:font-normal"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                {/* Documento */}
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Documento</label>
                  <div className="flex gap-2">
                    <select
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-2 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium appearance-none cursor-pointer w-20"
                      value={formData.doc_type}
                      onChange={e => setFormData({...formData, doc_type: e.target.value})}
                    >
                      <option value="RG">RG</option>
                      <option value="CPF">CPF</option>
                    </select>
                    <input
                      placeholder="Número do documento..."
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3.5 py-2 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium placeholder:font-normal"
                      value={formData.doc_number}
                      onChange={e => setFormData({...formData, doc_number: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Tipo</label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3.5 py-2 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium appearance-none cursor-pointer"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Prestador de Serviço">Prestador</option>
                      <option value="Visitante">Visitante</option>
                      <option value="Entregador">Entregador</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Status</label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3.5 py-2 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium appearance-none cursor-pointer"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="autorizado">Autorizado</option>
                      <option value="pendente">Pendente</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Data</label>
                    <input
                      required
                      type="date"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3.5 py-2 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Horário</label>
                    <input
                      required
                      type="time"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3.5 py-2 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Autorizado por</label>
                  <input
                    placeholder="Nome de quem autorizou..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3.5 py-1.5 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium placeholder:font-normal"
                    value={formData.authorizedBy}
                    onChange={e => setFormData({...formData, authorizedBy: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Descrição do Serviço</label>
                  <textarea
                    rows={2}
                    placeholder="Descreva o serviço a ser realizado..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3.5 py-2 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-normal placeholder:font-normal resize-none"
                    value={formData.observation}
                    onChange={e => setFormData({...formData, observation: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-black uppercase text-[9px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-[9px] tracking-widest shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  >
                    {editingService ? 'Salvar' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Visualizar Prestador */}
      <AnimatePresence>
        {viewingService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={() => setViewingService(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-36 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                {viewingService.photo_url ? (
                  <img src={viewingService.photo_url} alt={viewingService.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Briefcase size={48} className="text-slate-300" />
                  </div>
                )}
                <button onClick={() => setViewingService(null)} className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full transition-all">
                  <X size={16} />
                </button>
                <div className="absolute bottom-3 left-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                    viewingService.status === 'autorizado' ? 'bg-amber-500 text-white' :
                    viewingService.status === 'pendente' ? 'bg-rose-500 text-white' :
                    'bg-slate-600 text-white'
                  }`}>{viewingService.status}</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewingService.name}</h3>
                  <span className="text-amber-600 text-xs font-semibold uppercase tracking-tight">{viewingService.type}</span>
                </div>
                {viewingService.document && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Documento</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{viewingService.document.replace(':', ' ')}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Data</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{viewingService.date}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Horário</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{viewingService.time}</p>
                  </div>
                </div>
                {viewingService.observation && (
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Serviço</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{viewingService.observation.split(' || Autorizado por: ')[0]}"</p>
                  </div>
                )}
                <button
                  onClick={() => setViewingService(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Relatório */}
      <AnimatePresence>
        {showReportModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white dark:bg-slate-900 w-full max-w-[95vw] md:max-w-4xl rounded-[48px] overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Relatório de Manutenções</h3>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Período: Últimos {showReportModal.days} dias</p>
                </div>
                <button onClick={() => setShowReportModal({show: false, days: 0})} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-rose-500 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left py-4 px-2">Data</th>
                      <th className="text-left py-4 px-2">Prestador</th>
                      <th className="text-left py-4 px-2">Serviço</th>
                      <th className="text-left py-4 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getReportData(showReportModal.days).map(v => (
                      <tr key={v.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-2 text-xs font-semibold text-slate-600 dark:text-slate-400">{new Date(v.date || v.created_at || '').toLocaleDateString()}</td>
                        <td className="py-4 px-2 text-xs font-bold text-slate-900 dark:text-white uppercase">{v.name}</td>
                        <td className="py-4 px-2 text-xs font-semibold text-slate-500">{(v.observation || '').split(' || ')[0]}</td>
                        <td className="py-4 px-2">
                          <span className={`text-[9px] font-bold uppercase px-3 py-1 rounded-full ${
                            v.status === 'autorizado' ? 'bg-amber-500 text-white' :
                            v.status === 'pendente' ? 'bg-rose-500 text-white' :
                            'bg-slate-600 text-white'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Total: {getReportData(showReportModal.days).length} registros encontrados
                </p>
                <button className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-4 rounded-2xl font-semibold uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
                  <Download size={16} /> Baixar PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Banner */}
      <div className="mt-12 bg-gradient-to-br from-amber-500 to-orange-600 p-10 rounded-[48px] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-amber-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
        <div className="bg-white/10 p-5 rounded-[32px] backdrop-blur-md shrink-0 border border-white/20">
          <Wrench size={48} />
        </div>
        <div className="text-center md:text-left flex-1 relative z-10">
          <h4 className="text-2xl font-black mb-3 tracking-tight">Controle Total de Manutenções</h4>
          <p className="opacity-90 text-sm leading-relaxed max-w-xl font-medium">
            Registre todos os prestadores de serviço com foto e documento para máxima segurança do condomínio. O histórico completo fica disponível para relatórios.
          </p>
        </div>
        <button className="whitespace-nowrap bg-white text-amber-600 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-amber-900/20 active:scale-95">
          Ver Histórico
        </button>
      </div>
    </div>
  );
};
