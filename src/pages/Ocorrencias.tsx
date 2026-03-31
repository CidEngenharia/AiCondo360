import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertTriangle, AlertCircle, Info, ChevronRight, MessageCircle, Edit2, Trash2, Eye, X, FileText, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { FeatureHeader } from '../components/FeatureHeader';
import { useAuth } from '../hooks/useAuth';

type Priority = 'low' | 'medium' | 'high';
type Status = 'open' | 'in_progress' | 'resolved';

import { OcorrenciaService, Ocorrencia as IOcorrencia } from '../services/supabaseService';

interface OcorrenciasProps {
  userId: string;
  condoId: string;
  userRole: string;
}


const priorityConfig = {
  low: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  medium: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  high: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' }
};

const statusConfig = {
  open: { label: 'Aberto', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  in_progress: { label: 'Em Andamento', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  resolved: { label: 'Resolvido', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' }
};

export const Ocorrencias: React.FC<OcorrenciasProps> = ({ userId, condoId, userRole }) => {
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [selectedOccurrence, setSelectedOccurrence] = useState<IOcorrencia | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [ocorrencias, setOcorrencias] = useState<IOcorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState<{show: boolean, days: number}>({show: false, days: 0});
  
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('Convivência');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState<Status>('open');

  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = filter === 'all' ? ocorrencias : ocorrencias.filter(o => o.status === filter);

  const canManage = userRole === 'syndic' || userRole === 'admin' || userRole === 'global_admin';

  React.useEffect(() => {
    fetchOcorrencias();
  }, [userId, condoId]);

  const fetchOcorrencias = async () => {
    setLoading(true);
    try {
      const data = canManage 
        ? await OcorrenciaService.getCondoOcorrencias(condoId)
        : await OcorrenciaService.getUserOcorrencias(userId);
      setOcorrencias(data);
    } catch (error) {
      console.error('Error fetching ocorrencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if(!newTitle.trim() || !newDesc.trim()) return;
    
    try {
        if (editingId) {
            await OcorrenciaService.updateOcorrencia(editingId, {
                title: newTitle,
                category: newCat,
                description: newDesc,
                status: newStatus
            });
        } else {
            await OcorrenciaService.createOcorrencia({
                user_id: userId,
                condominio_id: condoId,
                title: newTitle,
                category: newCat,
                description: newDesc,
                status: newStatus,
                priority: 'medium',
                messages: 0
            });
        }
        fetchOcorrencias();
        setIsNewModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        setNewStatus('open');
        setEditingId(null);
    } catch (error: any) {
        console.error('Error saving ocorrencia:', error);
        alert('Erro ao salvar ocorrência: ' + (error?.message || 'Erro desconhecido. Verifique se você está vinculado a um condomínio.'));
    }
  };

  const handleEdit = (item: IOcorrencia) => {
    setNewTitle(item.title);
    setNewCat(item.category);
    setNewDesc(item.description);
    setNewStatus(item.status);
    setEditingId(item.id);
    setIsNewModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta ocorrência?')) {
      try {
        await OcorrenciaService.deleteOcorrencia(id);
        fetchOcorrencias();
      } catch (error: any) {
        console.error('Error deleting ocorrencia:', error);
        alert('Erro ao excluir: ' + (error?.message || 'Erro desconhecido.'));
      }
    }
  };

  const getReportData = (days: number) => {
    const cutOff = new Date();
    cutOff.setDate(cutOff.getDate() - days);
    return ocorrencias.filter(o => {
        const date = o.created_at ? new Date(o.created_at) : new Date();
        return date.getTime() >= cutOff.getTime();
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 w-full max-w-7xl mx-auto space-y-8">
      <FeatureHeader 
        icon={AlertCircle}
        title="Ocorrências"
        description="Abra ou acompanhe chamados e registros."
        color="bg-rose-500"
      >
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-400 text-white px-6 py-3 rounded-2xl font-medium transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]"
        >
          <Plus size={20} />
          <span>Nova Ocorrência</span>
        </button>
      </FeatureHeader>

       {/* Botões de Relatório */}
       <div className="flex justify-end gap-2 px-2">
          <button 
            onClick={() => setShowReportModal({show: true, days: 7})}
            className="text-[10px] font-medium uppercase tracking-widest text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full"
          >
              <FileText size={12} /> Relatório 7 Dias
          </button>
          <button 
            onClick={() => setShowReportModal({show: true, days: 15})}
            className="text-[10px] font-medium uppercase tracking-widest text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full"
          >
              <FileText size={12} /> Relatório 15 Dias
          </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === f 
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            {f === 'all' ? 'Todas' : statusConfig[f as Status].label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map(item => {
            const PriorityIcon = priorityConfig[item.priority].icon;
            const statusLabel = statusConfig[item.status].label;
            
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-[32px] p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className={cn("hidden sm:flex w-14 h-14 rounded-full shrink-0 items-center justify-center", priorityConfig[item.priority].bg)}>
                    <PriorityIcon size={28} className={priorityConfig[item.priority].color} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 truncate">
                          #{item.id} • {item.category}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest italic">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest", statusConfig[item.status].bg, statusConfig[item.status].color)}>
                        {statusLabel}
                      </span>
                    </div>
                    
                    <h3 className={cn("text-xl font-medium text-slate-900 dark:text-white truncate uppercase tracking-tighter", item.status === 'resolved' && "line-through opacity-50")}>
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 sm:line-clamp-1 italic font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:w-auto shrink-0 border-t border-slate-50 dark:border-slate-700/50 pt-4 sm:pt-0 sm:border-t-0 mt-2 sm:mt-0">
                    <div className="flex items-center gap-4 mr-2">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MessageCircle size={18} />
                        <span className="text-sm font-medium">{item.messages}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedOccurrence(item); }}
                        className="p-3 bg-slate-50 dark:bg-slate-700 hover:bg-rose-500 hover:text-white rounded-2xl text-slate-400 transition-all"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </button>

                      {canManage && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                            className="p-3 bg-slate-50 dark:bg-slate-700 hover:bg-amber-500 hover:text-white rounded-2xl text-slate-400 transition-all"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="p-3 bg-slate-50 dark:bg-slate-700 hover:bg-red-500 hover:text-white rounded-2xl text-slate-400 transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                      
                      <ChevronRight size={24} className="text-slate-200 group-hover:text-rose-500 transition-colors transform group-hover:translate-x-1 duration-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedOccurrence && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-800 rounded-[48px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className={cn("text-2xl font-medium dark:text-white uppercase tracking-tighter", selectedOccurrence.status === 'resolved' && "line-through opacity-50")}>{selectedOccurrence.title}</h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">#{selectedOccurrence.id} • {selectedOccurrence.category}</p>
                </div>
                <button onClick={() => setSelectedOccurrence(null)} className="p-3 bg-slate-50 dark:bg-slate-700 hover:bg-rose-500 hover:text-white rounded-2xl transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <div className="p-10 space-y-8">
                <div className="flex gap-4">
                  <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest shadow-xl", statusConfig[selectedOccurrence.status].bg, statusConfig[selectedOccurrence.status].color)}>
                    {statusConfig[selectedOccurrence.status].label}
                  </div>
                  <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest flex items-center gap-1.5 shadow-xl", priorityConfig[selectedOccurrence.priority].bg, priorityConfig[selectedOccurrence.priority].color)}>
                    {React.createElement(priorityConfig[selectedOccurrence.priority].icon, { size: 12 })}
                    Prioridade {selectedOccurrence.priority === 'high' ? 'Alta' : selectedOccurrence.priority === 'medium' ? 'Média' : 'Baixa'}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3 px-1">Descrição do Registro</h4>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 font-normal italic leading-relaxed text-slate-700 dark:text-slate-300">
                    "{selectedOccurrence.description}"
                  </div>
                </div>
                <div className="pt-4">
                  <button className="w-full bg-zinc-900 border-2 border-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium px-8 py-5 rounded-[24px] uppercase text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                    <MessageCircle size={18} /> Abrir Chamado de Mensagens ({selectedOccurrence.messages})
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nova Ocorrência */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white dark:bg-slate-800 rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-medium dark:text-white uppercase tracking-tighter italic">{editingId ? 'Editar Ocorrência' : 'Relatar Ocorrência'}</h3>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Canal Direto com a Gestão</p>
                </div>
                <button onClick={() => { setIsNewModalOpen(false); setEditingId(null); setNewTitle(''); setNewDesc(''); setNewStatus('open'); }} className="p-3 bg-slate-50 dark:bg-slate-700 hover:bg-rose-500 hover:text-white rounded-2xl transition-all group">
                  <X size={20} className="group-hover:rotate-90 transition-all text-slate-400" />
                </button>
              </div>
              <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handleCreateNew(); }}>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Título do Chamado</label>
                  <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-normal" placeholder="Resumo do problema" />
                </div>
                <div>
                  <select value={newCat} onChange={e => setNewCat(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-normal appearance-none cursor-pointer">
                    <option>Convivência</option>
                    <option>Manutenção</option>
                    <option>Segurança</option>
                    <option>Infraestrutura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Status</label>
                  <select 
                    value={newStatus} 
                    onChange={e => setNewStatus(e.target.value as Status)} 
                    className={cn(
                      "w-full border rounded-2xl px-5 py-4 text-sm focus:outline-none transition-all font-medium appearance-none cursor-pointer",
                      newStatus === 'open' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                      newStatus === 'in_progress' ? "bg-blue-50 border-blue-200 text-blue-700" :
                      "bg-rose-50 border-rose-200 text-rose-700"
                    )}
                  >
                    <option value="open">Aberto</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="resolved">Resolvido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 px-1">Detalhamento</label>
                  <textarea value={newDesc} required onChange={e => setNewDesc(e.target.value)} rows={4} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-normal resize-none" placeholder="Conte-nos o que aconteceu..." />
                </div>
                <div className="flex gap-4 pt-4">
                    <button 
                        type="button" 
                        onClick={() => setIsNewModalOpen(false)}
                        className="flex-1 px-8 py-5 rounded-[24px] border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium uppercase text-xs tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 bg-rose-500 text-white font-medium uppercase text-xs tracking-widest px-8 py-5 rounded-[24px] hover:bg-rose-600 transition-all shadow-2xl shadow-rose-500/40 active:scale-95"
                    >
                        {editingId ? 'Salvar Alterações' : 'Enviar Registro'}
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
                               <h3 className="text-2xl font-medium text-slate-900 dark:text-white uppercase tracking-tighter">Relatório de Ocorrências</h3>
                               <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Período: Últimos {showReportModal.days} dias</p>
                           </div>
                           <button onClick={() => setShowReportModal({show: false, days: 0})} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-rose-500 hover:text-white transition-all">
                               <X size={20} />
                           </button>
                       </div>

                       <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-medium uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <th className="text-left py-4 px-2">Data</th>
                                        <th className="text-left py-4 px-2">Título</th>
                                        <th className="text-left py-4 px-2">Categoria</th>
                                        <th className="text-left py-4 px-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getReportData(showReportModal.days).map(o => (
                                        <tr key={o.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-2 text-xs font-medium text-slate-600 dark:text-slate-400">{new Date(o.created_at).toLocaleDateString()}</td>
                                            <td className={cn("py-4 px-2 text-xs font-medium text-slate-900 dark:text-white uppercase", o.status === 'resolved' && "line-through opacity-50")}>
                                              {o.title}
                                            </td>
                                            <td className="py-4 px-2 text-xs font-medium text-slate-500">{o.category}</td>
                                            <td className="py-4 px-2">
                                                <span className={cn("text-[9px] font-medium uppercase px-2 py-1 rounded-full", statusConfig[o.status].bg, statusConfig[o.status].color)}>
                                                    {statusConfig[o.status].label}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                       </div>

                       <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                                Total: {getReportData(showReportModal.days).length} registros encontrados
                            </p>
                            <div className="flex gap-4">
                               <button className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-4 rounded-2xl font-medium uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
                                   <Download size={16} /> Baixar PDF
                               </button>
                            </div>
                       </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};
