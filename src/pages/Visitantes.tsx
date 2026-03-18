import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, User, Clock, CheckCircle2, Search, XCircle, Calendar } from 'lucide-react';

export const Visitantes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'esperados' | 'historico'>('esperados');

  const EXPECTED_VISITORS = [
    { id: '1', name: 'Carlos Silva', type: 'Visitante', date: 'Hoje', time: '19:00', status: 'pendente' },
    { id: '2', name: 'Ana Souza', type: 'Prestador de Serviço', date: 'Amanhã', time: '09:00', status: 'autorizado' },
  ];

  const HISTORIC = [
    { id: '3', name: 'Marcos Paulo', type: 'Entregador', date: '12/11/2024', time: '14:30', duration: '15 min' },
    { id: '4', name: 'Julia Costa', type: 'Visitante', date: '10/11/2024', time: '20:00', duration: '3h 45m' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Visitantes</h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Gerencie as permissões de entrada da sua unidade
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-500/20 active:scale-[0.98]">
          <Plus size={18} />
          <span>Nova Liberação</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('esperados')}
              className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'esperados' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Esperados
              {activeTab === 'esperados' && (
                <motion.div layoutId="visitantes-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'historico' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Histórico
              {activeTab === 'historico' && (
                <motion.div layoutId="visitantes-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar visitante..." 
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* List */}
          <div className="grid gap-3">
            {(activeTab === 'esperados' ? EXPECTED_VISITORS : HISTORIC).map((visitor) => (
              <motion.div 
                key={visitor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <User size={20} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{visitor.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{visitor.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5 justify-end">
                      <Calendar size={14} className="text-slate-400" />
                      {visitor.date}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 justify-end">
                      <Clock size={14} className="text-slate-400" />
                      {visitor.time}
                    </p>
                  </div>
                  {activeTab === 'esperados' && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Cancelar liberação">
                        <XCircle size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-blue-600 dark:text-blue-400" />
              Liberações Rápidas
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <p className="font-medium text-slate-900 dark:text-white text-sm">Entregador de Aplicativo</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Autoriza subida até o apartamento</p>
              </button>
              <button className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <p className="font-medium text-slate-900 dark:text-white text-sm">Festa / Evento</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Criar lista de convidados em lote</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

