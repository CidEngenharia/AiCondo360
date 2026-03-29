import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Search, Calendar, Clock, CheckCircle2, Shield, Trash2, Plus, X, Edit2, Phone, Briefcase, Truck, MoreHorizontal } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { VisitorService, Visitante as IVisitante } from '../services/supabaseService';

interface VisitantesProps {
  userId: string;
  condoId: string;
}

export const Visitantes: React.FC<VisitantesProps> = ({ userId, condoId }) => {
  const [visitors, setVisitors] = useState<IVisitante[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expected' | 'historic'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<IVisitante | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Visitante',
    date: '',
    time: '',
    status: 'autorizado' as 'pendente' | 'autorizado' | 'finalizado',
    observation: ''
  });

  useEffect(() => {
    fetchVisitors();
  }, [userId]);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const data = await VisitorService.getUserVisitors(userId);
      setVisitors(data.length > 0 ? data : []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (visitor?: IVisitante) => {
    if (visitor) {
      setEditingVisitor(visitor);
      setFormData({
        name: visitor.name,
        type: visitor.type,
        date: visitor.date,
        time: visitor.time,
        status: visitor.status,
        observation: visitor.observation || ''
      });
    } else {
      setEditingVisitor(null);
      setFormData({
        name: '',
        type: 'Visitante',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'autorizado',
        observation: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVisitor) {
        await VisitorService.updateVisitor(editingVisitor.id, formData);
      } else {
        await VisitorService.createVisitor({
          ...formData,
          user_id: userId,
          condominio_id: condoId
        });
      }
      setShowModal(false);
      fetchVisitors();
    } catch (error) {
      console.error('Error saving visitor:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja excluir esta liberação?')) {
      try {
        await VisitorService.deleteVisitor(id);
        fetchVisitors();
      } catch (error) {
        console.error('Error deleting visitor:', error);
      }
    }
  };

  const updateStatus = async (id: string, status: 'pendente' | 'autorizado' | 'finalizado') => {
    try {
      await VisitorService.updateVisitor(id, { status });
      fetchVisitors();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredVisitors = visitors.filter(visitor => {
    const isExpected = visitor.status === 'pendente' || visitor.status === 'autorizado';
    const matchesFilter = filter === 'all' || 
                         (filter === 'expected' && isExpected) ||
                         (filter === 'historic' && visitor.status === 'finalizado');
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          visitor.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Prestador de Serviço': return <Briefcase size={20} />;
      case 'Entregador': return <Truck size={20} />;
      default: return <User size={20} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <FeatureHeader 
        icon={User}
        title="Visitantes e Permissões"
        description="Gerencie as permissões de entrada na sua unidade, convidados e prestadores de serviço."
        color="bg-sky-600"
      />

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome ou tipo..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('expected')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'expected' ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Esperados
            </button>
            <button 
              onClick={() => setFilter('historic')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'historic' ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Histórico
            </button>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-sky-500/20 hover:scale-105"
          >
            <Plus size={20} />
            <span className="hidden lg:inline">Nova Liberação</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(id => (
            <div key={id} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] h-64 animate-pulse border border-slate-100 dark:border-slate-700"></div>
          ))}
        </div>
      ) : filteredVisitors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredVisitors.map((visitor) => (
              <motion.div
                key={visitor.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-4 rounded-3xl ${
                    visitor.status === 'autorizado' ? 'bg-emerald-100 text-emerald-600' :
                    visitor.status === 'pendente' ? 'bg-amber-100 text-amber-600' :
                    'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                  }`}>
                    {getTypeIcon(visitor.type)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      visitor.status === 'autorizado' ? 'bg-emerald-100 text-emerald-600' :
                      visitor.status === 'pendente' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {visitor.status}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenModal(visitor)}
                        className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(visitor.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
                    {visitor.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span className="font-bold text-sky-600/70">{visitor.type}</span>
                    {visitor.observation && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <span className="italic text-[10px] truncate max-w-[120px]">{visitor.observation}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Calendar size={12} />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Data</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {visitor.date === 'Hoje' ? new Date().toLocaleDateString('pt-BR') : visitor.date}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Clock size={12} />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Horário</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{visitor.time}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between gap-3">
                   {visitor.status !== 'finalizado' && (
                     <button 
                        onClick={() => updateStatus(visitor.id, 'finalizado')}
                        className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-sky-600 dark:hover:bg-sky-600 hover:text-white text-slate-600 dark:text-slate-300 px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                     >
                       <CheckCircle2 size={14} /> Finalizar
                     </button>
                   )}
                   {visitor.status === 'pendente' && (
                     <button 
                        onClick={() => updateStatus(visitor.id, 'autorizado')}
                        className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                     >
                       <Shield size={14} /> Liberar Entrada
                     </button>
                   )}
                   {visitor.status === 'finalizado' && (
                     <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest mx-auto py-2">
                       <CheckCircle2 size={16} className="text-emerald-500" />
                       Visita Concluída
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
            <User size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Nenhum visitante encontrado</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Você não possui visitantes {filter === 'expected' ? 'esperados' : filter === 'historic' ? 'no histórico' : ''} no momento.
          </p>
        </div>
      )}

      {/* Modal Nova Liberação / Edição */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-[40px] w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl custom-scrollbar"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {editingVisitor ? 'Editar Liberação' : 'Nova Liberação'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Dados do convidado</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Nome Completo</label>
                  <input 
                    required
                    maxLength={50}
                    placeholder="Nome do visitante ou prestador..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold placeholder:font-medium"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Tipo</label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold appearance-none"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Visitante">Visitante</option>
                      <option value="Prestador de Serviço">Prestador de Serviço</option>
                      <option value="Entregador">Entregador</option>
                      <option value="Familiar">Familiar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Status</label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold appearance-none"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="autorizado">Autorizado</option>
                      <option value="pendente">Pendente</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Data Prevista</label>
                    <input 
                      required
                      type="date"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Horário Aproximado</label>
                    <input 
                      required
                      type="time"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold"
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Observação (Motivo da Visita)</label>
                  <textarea 
                    rows={2}
                    placeholder="Ex: Entregar documentos, reparo hidráulico..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold placeholder:font-medium resize-none text-xs"
                    value={formData.observation}
                    onChange={e => setFormData({...formData, observation: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02]"
                  >
                    {editingVisitor ? 'Salvar' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Tip */}
      <div className="mt-12 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[48px] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
        <div className="bg-white/10 p-5 rounded-[32px] backdrop-blur-md shrink-0 border border-white/20">
          <Shield size={48} />
        </div>
        <div className="text-center md:text-left flex-1 relative z-10">
          <h4 className="text-2xl font-black mb-3 tracking-tight">Reduza Filas na Portaria</h4>
          <p className="opacity-90 text-sm leading-relaxed max-w-xl font-medium">
            Visitantes pré-autorizados pelo app AI Condo360 possuem um fluxo de entrada prioritário. Ao registrar uma visita, a portaria recebe uma notificação instantânea com data e hora prevista.
          </p>
        </div>
        <button className="whitespace-nowrap bg-white text-blue-700 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-900/20 active:scale-95">
          Ver Guia Completo
        </button>
      </div>
    </div>
  );
};
