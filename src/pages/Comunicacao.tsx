import React from 'react';
import { Mail, MessageSquare, Megaphone, Calendar, Users, Send, Search, Bell } from 'lucide-react';
import { motion } from 'motion/react';

const ComunicacaoPage: React.FC = () => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Comunicação</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Conecte-se com os condôminos através de murais, avisos e mensagens.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none">
            <Megaphone size={18} />
            Novo Aviso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'Mensagens Recebidas', value: '28', icon: MessageSquare, color: 'bg-indigo-500' },
          { label: 'Assembleias Agendadas', value: '2', icon: Calendar, color: 'bg-violet-500' },
          { label: 'Avisos Ativos', value: '14', icon: Megaphone, color: 'bg-rose-500' },
          { label: 'Sugestões Pendentes', value: '5', icon: Bell, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                <stat.icon size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
             <div className="flex items-center gap-3 mb-6">
                <Megaphone size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mural de Avisos</h2>
             </div>
             
             <div className="space-y-4">
                {[
                  { title: 'Manutenção na Piscina', date: 'Hoje, 14:00', type: 'Manutenção', status: 'Ativo' },
                  { title: 'Assembleia Ordinária de Dezembro', date: 'Amanhã, 19:30', type: 'Assembleia', status: 'Ativo' },
                  { title: 'Novo horário da coleta seletiva', date: 'Há 2 dias', type: 'Informativo', status: 'Finalizado' },
                ].map((aviso, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all flex items-start gap-4 cursor-pointer">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      {aviso.type === 'Manutenção' ? <Calendar size={20} className="text-blue-500" /> : <Megaphone size={20} className="text-emerald-500" />}
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <h4 className="font-bold text-slate-800 dark:text-white">{aviso.title}</h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">{aviso.date}</p>
                       </div>
                       <p className="text-sm text-slate-500 mt-1">Status: <span className={aviso.status === 'Ativo' ? 'text-emerald-500' : 'text-slate-400'}>{aviso.status}</span></p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 overflow-hidden">
             <div className="flex items-center gap-3 mb-6">
                <Users size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Grupos de Contato</h2>
             </div>
             <div className="space-y-3">
                {['Administração', 'Financeiro', 'Limpeza', 'Segurança'].map((group, i) => (
                  <button key={i} className="w-full text-left p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-between border border-transparent hover:border-blue-500/20">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{group}</span>
                    <MessageSquare size={16} className="text-slate-400" />
                  </button>
                ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ComunicacaoPage;
