import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Bell, Search, Filter, Mail, MailOpen, Trash2, Star, ChevronRight, Info } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { supabase } from '../lib/supabase';
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

export const Comunicados: React.FC<ComunicadosProps> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch both global (user_id is null) and specific messages
        const { data, error } = await supabase
          .from('comunicados')
          .select('*')
          .or(`user_id.eq.${userId},user_id.is.null`)
          .order('date', { ascending: false });

        if (error) throw error;
        
        const formattedMessages = (data || []).map(m => ({
          ...m,
          date: format(new Date(m.date), "dd 'de' MMM", { locale: ptBR })
        }));

        setMessages(formattedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [userId]);

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread') return !m.read;
    if (filter === 'starred') return m.starred;
    return true;
  });

  const toggleStar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    try {
      const { error } = await supabase
        .from('comunicados')
        .update({ starred: !msg.starred })
        .eq('id', id);

      if (error) throw error;
      setMessages(msgs => msgs.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
    } catch (err) {
      console.error('Error toggling star:', err);
    }
  };

  const markAsRead = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    if (!msg.read) {
      try {
        const { error } = await supabase
          .from('comunicados')
          .update({ read: true })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }

    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: true } : m));
    setSelectedMsg(id);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <FeatureHeader 
        icon={MessageSquare}
        title="Comunicados e Mensagens"
        description="Fique por dentro de tudo o que acontece no seu condomínio com informativos oficiais."
        color="bg-blue-500"
      />

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
        {/* Sidebar - Desktop */}
        <div className="w-full md:w-64 border-r border-slate-100 dark:border-slate-700 p-4 space-y-2 bg-slate-50/50 dark:bg-slate-900/10">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium italic"
            />
          </div>

          <button 
            onClick={() => setFilter('all')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <div className="flex items-center gap-3">
              <Mail size={16} />
              <span>Todos</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === 'all' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>{messages.length}</span>
          </button>

          <button 
            onClick={() => setFilter('unread')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${filter === 'unread' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <div className="flex items-center gap-3">
              <Bell size={16} />
              <span>Não Lidos</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === 'unread' ? 'bg-white/20' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}>
              {messages.filter(m => !m.read).length}
            </span>
          </button>

          <button 
            onClick={() => setFilter('starred')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${filter === 'starred' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <div className="flex items-center gap-3">
              <Star size={16} />
              <span>Importantes</span>
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
                  onClick={() => markAsRead(msg.id)}
                  className={`p-4 md:p-6 cursor-pointer flex gap-4 transition-all ${msg.read ? 'opacity-80' : 'bg-blue-50/10'}`}
                >
                  <button 
                    onClick={(e) => toggleStar(msg.id, e)}
                    className={`mt-1 flex-shrink-0 transition-colors ${msg.starred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
                  >
                    <Star size={18} fill={msg.starred ? 'currentColor' : 'none'} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm truncate pr-4 ${msg.read ? 'font-medium text-slate-600 dark:text-slate-400' : 'font-black text-slate-900 dark:text-white'}`}>
                        {msg.sender}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{msg.date}</span>
                    </div>
                    <p className={`text-sm mb-1 ${msg.read ? 'text-slate-500' : 'font-bold text-slate-800 dark:text-slate-200'}`}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                      {msg.preview}
                    </p>
                  </div>

                  <div className="flex-shrink-0 self-center">
                    {!msg.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm shadow-blue-500/50"></div>
                    )}
                  </div>
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
    </div>
  );
};
