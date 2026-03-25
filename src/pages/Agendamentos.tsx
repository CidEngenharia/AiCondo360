import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Clock, Truck, Hammer, Package, FileText, ChevronRight, X, User, Trash2, CheckCircle2 } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES);
  const [newSchedule, setNewSchedule] = useState<Omit<Schedule, 'id' | 'status'>>({
    title: '',
    type: 'outros',
    date: '',
    time: '',
    description: '',
  });

  const filteredSchedules = schedules.filter(s => {
    if (activeTab === 'ativos') {
      return s.status === 'pendente' || s.status === 'aprovado';
    }
    return s.status === 'concluido' || s.status === 'rejeitado';
  });

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const schedule: Schedule = {
      ...newSchedule,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pendente',
    };
    setSchedules([schedule, ...schedules]);
    setIsModalOpen(false);
    setNewSchedule({ title: '', type: 'outros', date: '', time: '', description: '' });
  };

  const handleApprove = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: 'aprovado' } : s));
  };

  const handleDelete = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 w-full max-w-7xl mx-auto space-y-8">
      <FeatureHeader
        icon={Calendar}
        title="Agendamentos"
        description="Gerencie mudanças, reformas e serviços na sua unidade."
        color="bg-blue-600"
      >
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
        >
          <Plus size={20} />
          <span>Novo Agendamento</span>
        </button>
      </FeatureHeader>

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
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1">
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

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-auto sm:ml-4">
                      {schedule.status === 'pendente' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleApprove(schedule.id); }}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Aprovar"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(schedule.id); }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={20} />
                      </button>
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

      {/* New Appointment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novo Agendamento</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Preencha os dados abaixo</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Assunto</label>
                  <input
                    required
                    value={newSchedule.title}
                    onChange={e => setNewSchedule(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Mudança de Entrada"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Tipo</label>
                    <select
                      value={newSchedule.type}
                      onChange={e => setNewSchedule(prev => ({ ...prev, type: e.target.value as ScheduleType }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    >
                      {Object.entries(TYPE_CONFIG).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Data</label>
                    <input
                      required
                      type="date"
                      value={newSchedule.date}
                      onChange={e => setNewSchedule(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Horário</label>
                  <input
                    required
                    placeholder="Ex: 08:00 - 18:00"
                    value={newSchedule.time}
                    onChange={e => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Descrição</label>
                  <textarea
                    rows={3}
                    value={newSchedule.description}
                    onChange={e => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detalhes adicionais..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

