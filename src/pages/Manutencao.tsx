import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wrench, Search, Calendar, Clock, CheckCircle2, Shield, Trash2, Plus, X, Edit2, Phone, Briefcase, Truck, MoreHorizontal, FileText, Download } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { VisitorService, Visitante as IVisitante } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';

interface ManutencaoProps {
  userId: string;
  condoId: string;
  userRole?: string;
}

export const Manutencao: React.FC<ManutencaoProps> = ({ userId, condoId, userRole }) => {
  const { user } = useAuth();

  const [services, setServices] = useState<IVisitante[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expected' | 'historic'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const canManage = userRole === 'admin' || userRole === 'syndic' || userRole === 'global_admin';
  const [showReportModal, setShowReportModal] = useState<{show: boolean, days: number}>({show: false, days: 0});

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
    authorizedBy: ''
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
      
      // Filter only maintenance/service types
      const maintenanceData = data.filter(v => v.type === 'Prestador de Serviço');
      setServices(maintenanceData.length > 0 ? maintenanceData : []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
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
      setFormData({
        name: service.name,
        type: service.type,
        date: service.date,
        time: service.time,
        status: service.status,
        observation: obs,
        authorizedBy: authBy
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
        authorizedBy: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalCondoId = condoId || user?.condoId;
      if (!finalCondoId || finalCondoId.trim() === '') {
        alert("⚠️ Sem condomínio selecionado!\n\nSe você for Administrador Global, selecione um condomínio no menu superior antes de registrar um serviço.");
        return;
      }

      const finalObservation = formData.authorizedBy 
        ? `${formData.observation}${formData.observation ? ' || ' : ''}Autorizado por: ${formData.authorizedBy}`
        : formData.observation;

      const submitData = {
          name: formData.name,
          type: formData.type,
          date: formData.date,
          time: formData.time,
          status: formData.status,
          observation: finalObservation
      };

      if (editingService) {
        await VisitorService.updateVisitor(editingService.id, submitData);
      } else {
        await VisitorService.createVisitor({
          ...submitData,
          user_id: userId,
          condominio_id: finalCondoId
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
    if (window.confirm('Deseja excluir este serviço?')) {
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
      alert('Erro ao atualizar status: ' + (error?.message || 'Erro desconhecido.'));
    }
  };

  const filteredServices = services.filter(service => {
    const isExpected = service.status === 'pendente' || service.status === 'autorizado';
    const matchesFilter = filter === 'all' || 
                         (filter === 'expected' && isExpected) ||
                         (filter === 'historic' && service.status === 'finalizado');
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getReportData = (days: number) => {
    const cutOff = new Date();
    cutOff.setDate(cutOff.getDate() - days);
    return services.filter(v => {
        const visitDate = new Date(v.date || v.created_at || '');
        return visitDate >= cutOff;
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <FeatureHeader 
        icon={Wrench}
        title="Controle de Manutenção"
        description="Gerencie prestadores de serviço, obras e manutenções técnicas no condomínio."
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
            placeholder="Buscar por nome ou serviço..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('expected')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'expected' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Agendados
            </button>
            <button 
              onClick={() => setFilter('historic')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'historic' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Histórico
            </button>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-2xl font-semibold transition-all shadow-lg shadow-amber-500/20 hover:scale-105"
          >
            <Plus size={20} />
            <span className="hidden lg:inline">Novo Serviço</span>
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
                    service.status === 'autorizado' ? 'bg-emerald-500 text-white' :
                    service.status === 'pendente' ? 'bg-amber-500 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    <Briefcase size={20} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      service.status === 'autorizado' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                      service.status === 'pendente' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                      'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    }`}>
                      {service.status}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenModal(service)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                    {service.name}
                  </h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-amber-600 font-semibold text-xs uppercase tracking-tight italic opacity-80">Prestador de Serviço</span>
                    {service.observation && (
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 mt-1">
                        <p className="italic text-[11px] text-slate-500 leading-relaxed font-normal">
                          "{service.observation.split(' || Autorizado por: ')[0]}"
                        </p>
                      </div>
                    )}
                    {service.observation?.includes('Autorizado por: ') && (
                      <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20 w-fit">
                        <Shield size={10} className="text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                          Autorizado por: <span className="font-bold">{service.observation.split(' || Autorizado por: ')[1]}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center mb-2">
                      <span className="bg-amber-600 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Calendar size={8} /> Data
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {service.date === 'Hoje' ? new Date().toLocaleDateString('pt-BR') : service.date}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center mb-2">
                      <span className="bg-amber-600 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1">
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
                        className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-amber-600 dark:hover:bg-amber-600 hover:text-white text-slate-600 dark:text-slate-300 px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 mt-2"
                     >
                       <CheckCircle2 size={14} /> Finalizar
                     </button>
                   )}
                   {service.status === 'pendente' && (
                     <button 
                        onClick={() => updateStatus(service.id, 'autorizado')}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 mt-2"
                     >
                       <Shield size={14} /> Liberar Entrada
                     </button>
                   )}
                    {service.status === 'finalizado' && (
                      <div className="flex flex-col items-center gap-1 mx-auto py-2">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          Trabalho Concluído
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
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Nenhuma manutenção encontrada</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Você não possui serviços {filter === 'expected' ? 'agendados' : filter === 'historic' ? 'no histórico' : ''} no momento.
          </p>
        </div>
      )}

      {/* Modal Nova Liberação / Edição */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-800 rounded-[24px] w-full max-w-[300px] overflow-hidden shadow-2xl flex flex-col border border-white/10"
            >
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 z-10">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-70">Dados do prestador</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-5 py-5 space-y-3.5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Nome do Prestador/Empresa</label>
                  <input 
                    required
                    maxLength={50}
                    placeholder="Nome..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3.5 py-2 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium placeholder:font-normal"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Tipo</label>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3.5 py-2 text-[11px] text-slate-500 font-bold uppercase">
                      Serviço
                    </div>
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3.5 py-1.5 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium placeholder:font-normal mb-3"
                    value={formData.authorizedBy}
                    onChange={e => setFormData({...formData, authorizedBy: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Descrição/Obs</label>
                  <textarea 
                    rows={2}
                    placeholder="O que será feito..."
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
                    className="flex-1 px-4 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[9px] tracking-widest shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  >
                    {editingService ? 'Salvar' : 'Confirmar'}
                  </button>
                </div>
              </form>
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
                               <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Relatório de Manutenção</h3>
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
                                        <th className="text-left py-4 px-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getReportData(showReportModal.days).map(v => (
                                        <tr key={v.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-2 text-xs font-semibold text-slate-600 dark:text-slate-400">{new Date(v.date || v.created_at || '').toLocaleDateString()}</td>
                                            <td className="py-4 px-2 text-xs font-bold text-slate-900 dark:text-white uppercase">{v.name}</td>
                                            <td className="py-4 px-2">
                                                <span className={`text-[9px] font-bold uppercase px-3 py-1 rounded-full ${
                                                    v.status === 'autorizado' ? 'bg-emerald-500 text-white' : 
                                                    v.status === 'pendente' ? 'bg-amber-500 text-white' : 
                                                    'bg-blue-600 text-white'
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
                            <div className="flex gap-4">
                               <button className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-4 rounded-2xl font-semibold uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
                                   <Download size={16} /> Baixar PDF
                               </button>
                            </div>
                       </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      {/* Maintenance Tip */}
      <div className="mt-12 bg-gradient-to-br from-amber-600 to-orange-700 p-10 rounded-[48px] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-amber-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
        <div className="bg-white/10 p-5 rounded-[32px] backdrop-blur-md shrink-0 border border-white/20">
          <Wrench size={48} />
        </div>
        <div className="text-center md:text-left flex-1 relative z-10">
          <h4 className="text-2xl font-black mb-3 tracking-tight">Manutenção em Dia</h4>
          <p className="opacity-90 text-sm leading-relaxed max-w-xl font-medium">
            Mantenha o histórico técnico de todos os serviços realizados no condomínio. O controle de manutenção ajuda na prevenção de problemas e valorização do patrimônio.
          </p>
        </div>
        <button className="whitespace-nowrap bg-white text-amber-700 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-amber-900/20 active:scale-95">
          Ver Histórico Geral
        </button>
      </div>
    </div>
  );
};
