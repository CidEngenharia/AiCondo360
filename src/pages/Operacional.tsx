import React from 'react';
import { Settings, Wrench, ClipboardList, CheckSquare, Clock, AlertTriangle, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';

const OperacionalPage: React.FC = () => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gestão Operacional</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Supervisione tarefas, manutenções e chamados técnicos em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none">
            <ClipboardList size={18} />
            Nova Tarefa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Chamados Abertos', value: '12', icon: AlertTriangle, color: 'bg-rose-500', trend: '+2 hoje' },
          { label: 'Manutenções Previstas', value: '5', icon: Settings, color: 'bg-blue-500', trend: 'Póx. 7 dias' },
          { label: 'Tarefas em Andamento', value: '8', icon: Clock, color: 'bg-indigo-500', trend: '4 urgentes' },
          { label: 'Tarefas Concluídas', value: '142', icon: CheckSquare, color: 'bg-emerald-500', trend: 'Total mês' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
                <stat.icon size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Fila de Chamados</h2>
              <div className="flex items-center gap-2">
                 <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">Filtrar por Prioridade</button>
              </div>
           </div>
           <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {[
                { title: 'Vazamento no 4º andar', priority: 'Alta', status: 'Aberto', tenant: 'Apto 402', age: '2h' },
                { title: 'Troca de lâmpadas no Hall', priority: 'Média', status: 'Em progresso', tenant: 'Áreas Comuns', age: '1d' },
                { title: 'Ajuste no portão da garagem', priority: 'Alta', status: 'Aberto', tenant: 'Infraestrutura', age: '4h' },
                { title: 'Pintura da fachada (retoques)', priority: 'Baixa', status: 'Pausado', tenant: 'Áreas Externas', age: '3d' },
              ].map((chamado, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer group">
                   <div className="flex items-center gap-4">
                     <div className={`w-2 h-2 rounded-full ${chamado.priority === 'Alta' ? 'bg-rose-500' : chamado.priority === 'Média' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                     <div>
                        <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{chamado.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-slate-400">
                           <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">{chamado.tenant}</span>
                           <span>•</span>
                           <span>Criado há {chamado.age}</span>
                        </div>
                     </div>
                   </div>
                   <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${chamado.status === 'Aberto' ? 'bg-rose-100 text-rose-600' : chamado.status === 'Em progresso' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                         {chamado.status}
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 overflow-hidden">
             <div className="flex items-center gap-3 mb-6">
                <Wrench size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manutenção Preventiva</h2>
             </div>
             <div className="space-y-5">
                {[
                  { name: 'Elevadores', next: '15 Jan 2024', progress: 85 },
                  { name: 'Bombas D\'água', next: '22 Jan 2024', progress: 40 },
                  { name: 'Ar Condicionado', next: '05 Fev 2024', progress: 10 },
                  { name: 'Jardinagem/Poda', next: '28 Jan 2024', progress: 0 },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                        <span className="text-slate-400">{item.next}</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${item.progress}%` }} />
                     </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OperacionalPage;
