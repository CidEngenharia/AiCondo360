import React from 'react';
import { Users, UserPlus, FileText, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';

const CondominoPage: React.FC = () => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gestão de Condôminos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie moradores, proprietários e unidades habitacionais.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <FileText size={18} />
            Exportar Relatório
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none">
            <UserPlus size={18} />
            Novo Morador
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total de Unidades', value: '124', icon: Users, color: 'bg-blue-500' },
          { label: 'Moradores Ativos', value: '412', icon: UserPlus, color: 'bg-emerald-500' },
          { label: 'Unidades Vagas', value: '8', icon: Search, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, unidade ou CPF..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <Filter size={16} />
              Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto text-slate-300 dark:text-slate-600 p-12 text-center">
           <Users size={48} className="mx-auto mb-4 opacity-20" />
           <p className="font-medium text-slate-400">Nenhum registro encontrado.</p>
           <p className="text-sm text-slate-500">Tente ajustar seus filtros de busca.</p>
        </div>
      </div>
    </div>
  );
};

export default CondominoPage;
