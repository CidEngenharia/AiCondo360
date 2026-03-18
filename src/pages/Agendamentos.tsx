import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Clock, Truck, Hammer, Package, FileText, ChevronRight, X, User } from 'lucide-react';
import { cn } from '../lib/utils';

type ScheduleType = 'mudanca' | 'reforma' | 'entrega' | 'manutencao' | 'outros';
type ScheduleStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'concluido';

interface Schedule {
  id: string;
  title: string;
  type: ScheduleType;
  date: string;
  time: string;
  status: ScheduleStatus;
  description: string;
}

const MOCK_SCHEDULES: Schedule[] = [
  {
    id: '1',
    title: 'Mudança de Entrada',
    type: 'mudanca',
    date: '15/11/2024',
    time: '08:00 - 18:00',
    status: 'aprovado',
    description: 'Mudança completa. Necessário uso do elevador de serviço com capa.',
  },
  {
    id: '2',
    title: 'Reforma do Banheiro',
    type: 'reforma',
    date: '20/11/2024',
    time: '09:00 - 17:00',
    status: 'pendente',
    description: 'Troca de piso e encanamento. Empreiteira XYZ responsável.',
  },
  {
    id: '3',
    title: 'Entrega de Geladeira',
    type: 'entrega',
    date: '10/11/2024',
    time: '14:00 - 16:00',
    status: 'concluido',
    description: 'Magazine Luiza. Não caberá no elevador social.',
  }
];

const TYPE_CONFIG = {
  mudanca: { label: 'Mudança', icon: Truck, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  reforma: { label: 'Reforma', icon: Hammer, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  entrega: { label: 'Entrega Grande', icon: Package, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  manutencao: { label: 'Manutenção', icon: Hammer, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  outros: { label: 'Outros', icon: FileText, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10' },
};

const STATUS_CONFIG = {
  pendente: { label: 'Pendente', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
  aprovado: { label: 'Aprovado', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  rejeitado: { label: 'Rejeitado', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
  concluido: { label: 'Concluído', color: 'text-slate-700 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-500/10' },
};

export const Agendamentos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ativos' | 'historico'>('ativos');

  const filteredSchedules = MOCK_SCHEDULES.filter(s => {
    if (activeTab === 'ativos') {
      return s.status === 'pendente' || s.status === 'aprovado';
    }
    return s.status === 'concluido' || s.status === 'rejeitado';
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Agendamentos</h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Gerencie mudanças, reformas e serviços na sua unidade
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-500/20 active:scale-[0.98]">
          <Plus size={18} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('ativos')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'ativos'
              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          Agendamentos Ativos
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'historico'
              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          Histórico
        </button>
      </div>

      {/* Content */}
      {filteredSchedules.length > 0 ? (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSchedules.map((schedule) => {
              const TypeIcon = TYPE_CONFIG[schedule.type].icon;
              return (
                <motion.div
                  key={schedule.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Icon */}
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", TYPE_CONFIG[schedule.type].bg, TYPE_CONFIG[schedule.type].color)}>
                      <TypeIcon size={24} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {schedule.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={14} />
                              {schedule.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} />
                              {schedule.time}
                            </span>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-semibold w-fit",
                          STATUS_CONFIG[schedule.status].bg,
                          STATUS_CONFIG[schedule.status].color
                        )}>
                          {STATUS_CONFIG[schedule.status].label}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {schedule.description}
                      </p>
                    </div>

                    {/* Chevron */}
                    <div className="hidden sm:flex items-center shrink-0 text-slate-400 group-hover:text-blue-500 transition-colors ml-4 transform group-hover:translate-x-1 duration-200">
                      <ChevronRight size={24} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Calendar size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Nenhum agendamento</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            {activeTab === 'ativos' 
              ? "Você não possui agendamentos ativos no momento."
              : "Seu histórico de agendamentos está vazio."}
          </p>
        </motion.div>
      )}
    </div>
  );
};

