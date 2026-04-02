import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Bell, Search, Filter, Mail, MailOpen, Trash2, Star, Plus, X, Edit, Send } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { AnnouncementService, Comunicado } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  content?: string;
  date: string;
  read: boolean;
  starred: boolean;
  type: 'admin' | 'syndic' | 'system';
}

interface ComunicadosProps {
  userId?: string;
}

export const Comunicados: React.FC<ComunicadosProps> = ({ userId: propUserId }) => {
  const { user } = useAuth();
  const condoId = user?.condoId;
  const currentUserId = propUserId || user?.id;
  const isAdmin = user?.role === 'syndic' || user?.role === 'global_admin' || user?.role === 'admin';

  const [messages, setMessages] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'aviso' | 'comunicado' | 'evento'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'aviso' | 'comunicado' | 'evento'>('aviso');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!condoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await AnnouncementService.getAllAnnouncements(condoId);
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [condoId]);

  const filteredMessages = messages.filter(m => {
    if (filter === 'all') return true;
    return m.category === filter;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condoId || !user) return;

    try {
      if (editingId) {
        await AnnouncementService.updateAnnouncement(editingId, {
          title,
          content,
          category
        });
      } else {
        await AnnouncementService.createAnnouncement({
          condominio_id: condoId,
          title,
          content,
          category,
          author: user.name
        });
      }
      setIsModalOpen(false);
      resetForm();
      fetchMessages();
    } catch (err) {
      console.error('Error saving announcement:', err);
      alert('Erro ao salvar comunicado');
    }
  };

  const handleEdit = (msg: Comunicado) => {
    setEditingId(msg.id);
    setTitle(msg.title);
    setContent(msg.content);
    setCategory(msg.category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mensagem?')) return;
    try {
      await AnnouncementService.deleteAnnouncement(id);
      fetchMessages();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('aviso');
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <FeatureHeader 
              icon={MessageSquare}
              title="Comunicados e Mensagens"
              description="Fique por dentro de tudo o que acontece no seu condomínio com informativos oficiais."
              color="bg-blue-500"
            />
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md active:scale-95 w-full sm:w-auto justify-center"
            >
              <Plus size={14} />
              Nova Mensagem
            </button>
          )}
        </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
        {/* Sidebar - Desktop */}
        <div className="w-full md:w-64 border-r border-slate-100 dark:border-slate-700 p-4 space-y-2 bg-slate-50/50 dark:bg-slate-900/10">
          <button 
            onClick={() => setFilter('all')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <div className="flex items-center gap-3">
              <Mail size={16} />
              <span>Todos</span>
            </div>
          </button>

          <button 
            onClick={() => setFilter('aviso')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${filter === 'aviso' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Avisos</span>
            </div>
          </button>

          <button 
            onClick={() => setFilter('comunicado')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${filter === 'comunicado' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Comunicados</span>
            </div>
          </button>

          <button 
            onClick={() => setFilter('evento')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${filter === 'evento' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>Eventos</span>
            </div>
          </button>

          <div className="pt-8 px-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              <Filter size={12} />
              <span>Categorias</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Admin
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Síndico
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                Avisos IA
              </div>
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.03)' }}
                  className="p-4 md:p-6 cursor-pointer flex gap-4 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          msg.category === 'aviso' ? 'bg-emerald-500' : 
                          msg.category === 'comunicado' ? 'bg-blue-500' : 'bg-amber-500'
                        }`}></div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {msg.author || 'Administração'}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        {format(new Date(msg.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {msg.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                      {msg.content}
                    </p>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(msg); }}
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-blue-500 transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {filteredMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-slate-50/30 dark:bg-slate-900/20 h-full">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <MailOpen className="text-slate-200" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 italic">Nenhuma mensagem aqui</h3>
              <p className="text-sm text-slate-500 italic">Limpo como um espelho! Ótima organização.</p>
            </div>
          )}
        </div>
      </div>
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
              className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Bell size={18} className="text-blue-500" />
                  {editingId ? 'Editar Mensagem' : 'Nova Mensagem'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Título</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Ex: Novo regulamento"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Categoria</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-xs appearance-none"
                  >
                    <option value="aviso">Aviso</option>
                    <option value="comunicado">Comunicado</option>
                    <option value="evento">Evento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Conteúdo</label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={4}
                    placeholder="Conteúdo oficial..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 transition-all text-xs italic"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-[0.2em] py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {editingId ? 'Salvar' : 'Publicar'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
