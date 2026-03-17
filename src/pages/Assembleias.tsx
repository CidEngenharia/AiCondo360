import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Calendar, Clock, FileText, ChevronRight, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { supabase } from '../lib/supabase';
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
  created_at: string;
}

interface AssembleiasProps {
  condoId?: string;
  userId?: string;
}

export const Assembleias: React.FC<AssembleiasProps> = ({ condoId, userId }) => {
  const [assembleias, setAssembleias] = useState<Assembleia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'active' | 'past'>('upcoming');

  useEffect(() => {
    async function fetchAssembleias() {
      if (!condoId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('assembleia')
          .select('*')
          .eq('condominio_id', condoId)
          .order('start_date', { ascending: true });

        if (error) throw error;
        setAssembleias(data || []);
      } catch (err) {
        console.error('Error fetching assembleias:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssembleias();
  }, [condoId]);

  const now = new Date();

  const filteredAssembleias = assembleias.filter((asc) => {
    const startDate = new Date(asc.start_date);
    const endDate = new Date(asc.end_date);
    
    // Simplification for UX: "active" means currently happening
    // "upcoming" means start_date is in the future
    // "past" means end_date is in the past, or status is closed
    if (filter === 'upcoming') {
      return isFuture(startDate) && asc.status !== 'closed';
    } else if (filter === 'active') {
      return isPast(startDate) && !isPast(endDate) && asc.status !== 'closed';
    } else {
      return isPast(endDate) || asc.status === 'closed';
    }
  });

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <FeatureHeader 
        icon={Users}
        title="Assembleias"
        description="Participe, vote e fique por dentro das decisões do seu condomínio de forma 100% digital."
        color="bg-indigo-500"
      />

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            filter === 'upcoming'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Próximas
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
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
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
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
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      filter === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      filter === 'past' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' :
                      'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    }`}>
                      {filter === 'active' ? <AlertCircle size={24} /> :
                       filter === 'past' ? <History size={24} /> :
                       <Calendar size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{assembleia.title}</h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {format(new Date(assembleia.start_date), "dd/MM 'às' HH:mm")}
                      </p>
                    </div>
                  </div>
                  {filter === 'active' && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                      Votação Aberta
                    </span>
                  )}
                  {filter === 'past' && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-full">
                      Encerrada
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 line-clamp-2">
                  {assembleia.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex -space-x-2">
                    {/* Mock avatars of participants */}
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold">JD</div>
                    <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold">MR</div>
                    <div className="w-8 h-8 rounded-full bg-rose-200 text-rose-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold">AL</div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">+12</div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Nenhuma assembleia encontrada</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Não há assembleias nesta categoria no momento. Quando houver, elas aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
