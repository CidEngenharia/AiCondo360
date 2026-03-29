import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, AlertTriangle, AlertCircle, Info, ChevronRight, MessageCircle, Edit2, Trash2, Eye, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { FeatureHeader } from '../components/FeatureHeader';
import { useAuth } from '../hooks/useAuth';

type Priority = 'low' | 'medium' | 'high';
type Status = 'open' | 'in_progress' | 'resolved';

interface Occurrence {
  id: string;
  title: string;
  category: string;
  date: string;
  status: Status;
  priority: Priority;
  description: string;
  messages: number;
}

const MOCK_DATA: Occurrence[] = [
  { id: '1', title: 'Barulho Excessivo', category: 'Convivência', date: 'Hoje, 14:20', status: 'open', priority: 'medium', description: 'Morador do apartamento de cima fazendo obra fora do horário permitido.', messages: 2 },
  { id: '2', title: 'Lâmpada Queimada', category: 'Manutenção', date: 'Ontem', status: 'resolved', priority: 'low', description: 'Lâmpada do corredor do 5º andar queimada.', messages: 1 },
  { id: '3', title: 'Vazamento na Garagem', category: 'Infraestrutura', date: '12/11/2024', status: 'in_progress', priority: 'high', description: 'Vazamento de água próximo à vaga 42.', messages: 5 }
];

const priorityConfig = {
  low: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  medium: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  high: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' }
};

const statusConfig = {
  open: { label: 'Aberto', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
  in_progress: { label: 'Em Andamento', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  resolved: { label: 'Resolvido', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' }
};

export const Ocorrencias: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [ocorrencias, setOcorrencias] = useState<Occurrence[]>(MOCK_DATA);
  
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('Convivência');
  const [newDesc, setNewDesc] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = filter === 'all' ? ocorrencias : ocorrencias.filter(o => o.status === filter);

  const canManage = user?.role === 'syndic' || user?.role === 'admin';

  const handleCreateNew = () => {
    if(!newTitle.trim() || !newDesc.trim()) return;
    
    if (editingId) {
      setOcorrencias(ocorrencias.map(o => o.id === editingId ? { ...o, title: newTitle, category: newCat, description: newDesc } : o));
    } else {
      const newOcc: Occurrence = {
        id: Math.random().toString(36).substr(2, 9),
        title: newTitle,
        category: newCat,
        date: 'Agora',
        status: 'open',
        priority: 'medium',
        description: newDesc,
        messages: 0
      };
      setOcorrencias([newOcc, ...ocorrencias]);
    }
    
    setIsNewModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setEditingId(null);
  };

  const handleEdit = (item: Occurrence) => {
    setNewTitle(item.title);
    setNewCat(item.category);
    setNewDesc(item.description);
    setEditingId(item.id);
    setIsNewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta ocorrência?')) {
      setOcorrencias(ocorrencias.filter(o => o.id !== id));
    }
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
          className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-400 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]"
        >
          <Plus size={20} />
          <span>Nova Ocorrência</span>
        </button>
      </FeatureHeader>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === f 
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className={cn("hidden sm:flex w-12 h-12 rounded-full shrink-0 items-center justify-center", priorityConfig[item.priority].bg)}>
                    <PriorityIcon size={24} className={priorityConfig[item.priority].color} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
                          #{item.id} • {item.category}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                        <span className="text-xs text-slate-500 whitespace-nowrap">{item.date}</span>
                      </div>
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap", statusConfig[item.status].bg, statusConfig[item.status].color)}>
                        {statusLabel}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 sm:line-clamp-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:w-auto shrink-0 border-t border-slate-100 dark:border-slate-700/50 pt-4 sm:pt-0 sm:border-t-0 mt-2 sm:mt-0">
                    <div className="flex items-center gap-4 mr-2">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MessageCircle size={16} />
                        <span className="text-sm font-medium">{item.messages}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedOccurrence(item); }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </button>

                      {canManage && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                      
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1 duration-200" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold dark:text-white">{selectedOccurrence.title}</h3>
                  <p className="text-sm text-slate-500">#{selectedOccurrence.id} • {selectedOccurrence.category}</p>
                </div>
                <button onClick={() => setSelectedOccurrence(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", statusConfig[selectedOccurrence.status].bg, statusConfig[selectedOccurrence.status].color)}>
                    {statusConfig[selectedOccurrence.status].label}
                  </div>
                  <div className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5", priorityConfig[selectedOccurrence.priority].bg, priorityConfig[selectedOccurrence.priority].color)}>
                    {React.createElement(priorityConfig[selectedOccurrence.priority].icon, { size: 12 })}
                    Prioridade {selectedOccurrence.priority === 'high' ? 'Alta' : selectedOccurrence.priority === 'medium' ? 'Média' : 'Baixa'}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Descrição</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedOccurrence.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity">
                    Abrir Mensagens ({selectedOccurrence.messages})
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Nova Ocorrência (Placeholder) */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold dark:text-white">{editingId ? 'Editar Ocorrência' : 'Relatar Ocorrência'}</h3>
                <button onClick={() => { setIsNewModalOpen(false); setEditingId(null); setNewTitle(''); setNewDesc(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateNew(); }}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-rose-500 transition-all" placeholder="Resumo do problema" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                  <select value={newCat} onChange={e => setNewCat(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-rose-500 transition-all">
                    <option>Convivência</option>
                    <option>Manutenção</option>
                    <option>Segurança</option>
                    <option>Infraestrutura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                  <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={4} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-rose-500 transition-all" placeholder="Detalhes da ocorrência..." />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-rose-500 text-white font-bold py-4 rounded-2xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-600/20"
                >
                  {editingId ? 'Salvar Alterações' : 'Enviar Ocorrência'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

