import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, AlertTriangle, AlertCircle, Info, ChevronRight, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { FeatureHeader } from '../components/FeatureHeader';

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
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const filtered = filter === 'all' ? MOCK_DATA : MOCK_DATA.filter(o => o.status === filter);

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 w-full max-w-7xl mx-auto space-y-8">
      <FeatureHeader 
        icon={AlertCircle}
        title="Ocorrências"
        description="Abra ou acompanhe chamados e registros."
        color="bg-rose-500"
      >
        <button className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-400 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]">
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

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-32 shrink-0 border-t border-slate-100 dark:border-slate-700/50 pt-4 sm:pt-0 sm:border-t-0 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MessageCircle size={16} />
                      <span className="text-sm font-medium">{item.messages}</span>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1 duration-200" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

